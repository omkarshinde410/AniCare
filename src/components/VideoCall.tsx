import { useEffect, useRef, useState } from 'react'

type SignalMessage = { type: string; role?: 'offerer' | 'answerer'; participants?: number; data?: unknown; message?: string }

const iceServers: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun.cloudflare.com:3478' },
  ...(import.meta.env.VITE_TURN_URL ? [{
    urls: import.meta.env.VITE_TURN_URL,
    username: import.meta.env.VITE_TURN_USERNAME,
    credential: import.meta.env.VITE_TURN_CREDENTIAL,
  }] : []),
]

export default function VideoCall({ appointmentId, date, startTime, endTime }: { appointmentId: string; date: string; startTime: string; endTime: string }) {
  const [active, setActive] = useState(false)
  const [now, setNow] = useState(() => new Date())
  const [status, setStatus] = useState('Ready for a private video call')
  const [microphoneMuted, setMicrophoneMuted] = useState(false)
  const [cameraDisabled, setCameraDisabled] = useState(false)
  const [hasRemoteVideo, setHasRemoteVideo] = useState(false)
  const remoteVideo = useRef<HTMLVideoElement>(null)
  const localVideo = useRef<HTMLVideoElement>(null)
  const remoteStream = useRef<MediaStream | null>(null)
  const socket = useRef<WebSocket | null>(null)
  const peer = useRef<RTCPeerConnection | null>(null)
  const localStream = useRef<MediaStream | null>(null)
  const role = useRef<'offerer' | 'answerer' | null>(null)
  const pendingSignals = useRef<object[]>([])
  const pendingCandidates = useRef<RTCIceCandidateInit[]>([])
  const start = new Date(`${date}T${startTime}`)
  const end = new Date(`${date}T${endTime}`)
  const withinWindow = now >= start && now <= end

  const sendSignal = (message: object) => {
    if (!socket.current || socket.current.readyState !== WebSocket.OPEN) {
      pendingSignals.current.push(message)
      return
    }
    socket.current.send(JSON.stringify(message))
  }

  const waitForIceGathering = async () => {
    const connection = peer.current
    if (!connection || connection.iceGatheringState === 'complete') return
    await new Promise<void>((resolve) => {
      const check = () => {
        if (connection.iceGatheringState === 'complete') {
          connection.removeEventListener('icegatheringstatechange', check)
          resolve()
        }
      }
      connection.addEventListener('icegatheringstatechange', check)
      window.setTimeout(check, 8000)
    })
  }

  const createOffer = async () => {
    if (!peer.current) return
    setStatus('Connecting to the other participant...')
    const offer = await peer.current.createOffer()
    await peer.current.setLocalDescription(offer)
    await waitForIceGathering()
    sendSignal({ type: 'offer', data: peer.current.localDescription })
    setStatus('Offer sent. Negotiating video connection...')
  }

  const startCall = async () => {
    try {
      const token = localStorage.getItem('ani-care-token')
      if (!token) throw new Error('Please log in again.')
      localStream.current = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      if (localVideo.current) localVideo.current.srcObject = localStream.current
      peer.current = new RTCPeerConnection({ iceServers })
      localStream.current.getTracks().forEach((track) => peer.current?.addTrack(track, localStream.current!))
      peer.current.ontrack = (event) => {
        remoteStream.current = event.streams[0] ?? new MediaStream([event.track])
        setHasRemoteVideo(true)
        if (remoteVideo.current) {
          remoteVideo.current.srcObject = remoteStream.current
          void remoteVideo.current.play().catch(() => undefined)
        }
      }
      peer.current.onicecandidate = (event) => {
        if (event.candidate) sendSignal({ type: 'candidate', data: event.candidate.toJSON() })
      }
      peer.current.onconnectionstatechange = () => {
        const state = peer.current?.connectionState ?? 'connecting'
        if (state === 'connected') setStatus('Call connected')
        else if (state === 'failed') setStatus('Peer connection failed. A TURN relay is required on this network.')
        else if (state === 'disconnected') setStatus('Connection interrupted. Trying to reconnect...')
        else setStatus(`Call ${state}`)
      }
      peer.current.oniceconnectionstatechange = () => {
        const state = peer.current?.iceConnectionState
        if (state === 'failed') setStatus('Network path failed. Configure a reachable Coturn TURN relay to connect these networks.')
        else if (state === 'disconnected') setStatus('Network connection interrupted. Reconnecting...')
      }

      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      socket.current = new WebSocket(`${protocol}//${window.location.host}/ws/signaling?appointmentId=${encodeURIComponent(appointmentId)}&token=${encodeURIComponent(token)}`)
      socket.current.onopen = () => {
        setStatus('Waiting for the other participant...')
        pendingSignals.current.splice(0).forEach((message) => sendSignal(message))
      }
      socket.current.onmessage = async (event) => {
        try {
          const message = JSON.parse(event.data) as SignalMessage
          if (message.type === 'role') {
            role.current = message.role ?? null
            setStatus(message.participants === 2 ? 'Both participants joined. Establishing video...' : 'Waiting for the other participant...')
          }
          if (message.type === 'joined') setStatus(message.participants === 2 ? 'Both participants joined. Establishing video...' : 'Waiting for the other participant...')
          if (message.type === 'peer-ready' && role.current === 'offerer') await createOffer()
          if (message.type === 'offer' && message.data) {
            await peer.current?.setRemoteDescription(message.data as RTCSessionDescriptionInit)
            const answer = await peer.current?.createAnswer()
            if (answer && peer.current) {
              await peer.current.setLocalDescription(answer)
              await waitForIceGathering()
              sendSignal({ type: 'answer', data: peer.current.localDescription })
            }
            const candidates = pendingCandidates.current.splice(0)
            await Promise.all(candidates.map(async (candidate) => {
              try { await peer.current?.addIceCandidate(candidate) } catch { }
            }))
          }
          if (message.type === 'answer' && message.data) {
            await peer.current?.setRemoteDescription(message.data as RTCSessionDescriptionInit)
            const candidates = pendingCandidates.current.splice(0)
            await Promise.all(candidates.map(async (candidate) => {
              try { await peer.current?.addIceCandidate(candidate) } catch { }
            }))
          }
          if (message.type === 'candidate' && message.data) {
            if (peer.current?.remoteDescription) {
              try { await peer.current.addIceCandidate(message.data as RTCIceCandidateInit) } catch { }
            }
            else pendingCandidates.current.push(message.data as RTCIceCandidateInit)
          }
          if (message.type === 'peer-left') setStatus('The other participant left the call.')
        } catch {
          setStatus('Unable to establish the video connection. Please try again.')
        }
      }
      socket.current.onerror = () => setStatus('Video signaling connection failed.')
      socket.current.onclose = (event) => {
        if (event.code !== 1000 && event.reason) setStatus(`Signaling closed: ${event.reason}`)
        else setStatus('Call ended')
      }
      setActive(true)
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Camera and microphone access is required.')
      localStream.current?.getTracks().forEach((track) => track.stop())
    }
  }

  const endCall = () => {
    sendSignal({ type: 'hangup' })
    socket.current?.close()
    peer.current?.close()
    localStream.current?.getTracks().forEach((track) => track.stop())
    if (localVideo.current) localVideo.current.srcObject = null
    if (remoteVideo.current) remoteVideo.current.srcObject = null
    remoteStream.current = null
    setHasRemoteVideo(false)
    setActive(false)
    setMicrophoneMuted(false)
    setCameraDisabled(false)
    setStatus('Call ended')
  }

  const toggleMicrophone = () => {
    const nextMuted = !microphoneMuted
    localStream.current?.getAudioTracks().forEach((track) => { track.enabled = !nextMuted })
    setMicrophoneMuted(nextMuted)
  }

  const toggleCamera = () => {
    const nextDisabled = !cameraDisabled
    localStream.current?.getVideoTracks().forEach((track) => { track.enabled = !nextDisabled })
    setCameraDisabled(nextDisabled)
  }

  useEffect(() => () => endCall(), [])

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    if (active && !withinWindow) endCall()
  }, [active, withinWindow])

  useEffect(() => {
    if (remoteVideo.current && remoteStream.current) {
      remoteVideo.current.srcObject = remoteStream.current
      void remoteVideo.current.play().catch(() => undefined)
    }
  }, [active])

  return (
    <div className="video-call">
      <div className="video-call-heading">
        <div>
          <strong>Video consultation</strong>
          <p className="muted">{date} · {startTime}–{endTime}</p>
        </div>
        <span className={`call-status ${active ? 'is-live' : ''}`}><span />{status}</span>
      </div>
      {!active ? (
        !withinWindow ? (
          <div className="call-unavailable">Video calling is available only during the scheduled appointment.</div>
        ) : (
          <div className="call-entry">
            <p>Join the private appointment call when both participants are ready.</p>
            <button type="button" className="button primary" onClick={startCall}>Join video call</button>
          </div>
        )
      ) : (
        <div className="call-session">
          <div className="video-grid">
            <video ref={remoteVideo} autoPlay playsInline onLoadedMetadata={(event) => void event.currentTarget.play().catch(() => undefined)} className="remote-video" />
            <video ref={localVideo} autoPlay muted playsInline className="local-video" />
            {!hasRemoteVideo && <div className="remote-video-empty">{status}</div>}
          </div>
          <div className="call-controls" aria-label="Video call controls">
            <button type="button" className={`call-control ${microphoneMuted ? 'is-disabled' : ''}`} onClick={toggleMicrophone} aria-label={microphoneMuted ? 'Turn microphone on' : 'Mute microphone'} title={microphoneMuted ? 'Turn microphone on' : 'Mute microphone'}>{microphoneMuted ? 'Mic off' : 'Mic on'}</button>
            <button type="button" className={`call-control ${cameraDisabled ? 'is-disabled' : ''}`} onClick={toggleCamera} aria-label={cameraDisabled ? 'Turn camera on' : 'Turn camera off'} title={cameraDisabled ? 'Turn camera on' : 'Turn camera off'}>{cameraDisabled ? 'Camera off' : 'Camera on'}</button>
            <button type="button" className="call-control call-end" onClick={endCall}>End call</button>
          </div>
        </div>
      )}
    </div>
  )
}
