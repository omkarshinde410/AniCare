import { useEffect, useRef, useState } from 'react'

type SignalMessage = { type: string; role?: 'offerer' | 'answerer'; data?: unknown }

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
  const remoteVideo = useRef<HTMLVideoElement>(null)
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

  const createOffer = async () => {
    if (!peer.current) return
    const offer = await peer.current.createOffer()
    await peer.current.setLocalDescription(offer)
    sendSignal({ type: 'offer', data: offer })
  }

  const startCall = async () => {
    try {
      const token = localStorage.getItem('ani-care-token')
      if (!token) throw new Error('Please log in again.')
      localStream.current = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      peer.current = new RTCPeerConnection({ iceServers })
      localStream.current.getTracks().forEach((track) => peer.current?.addTrack(track, localStream.current!))
      peer.current.ontrack = (event) => {
        remoteStream.current = event.streams[0] ?? new MediaStream([event.track])
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
        setStatus(state === 'connected' ? 'Call connected' : `Call ${state}`)
      }
      peer.current.oniceconnectionstatechange = () => {
        const state = peer.current?.iceConnectionState
        if (state === 'failed' || state === 'disconnected') setStatus('Network connection failed. A TURN server may be required.')
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
            setStatus(message.role === 'offerer' ? 'Waiting for the other participant...' : 'Connected, establishing video...')
          }
          if (message.type === 'peer-ready' && role.current === 'offerer') await createOffer()
          if (message.type === 'offer' && message.data) {
            await peer.current?.setRemoteDescription(message.data as RTCSessionDescriptionInit)
            const answer = await peer.current?.createAnswer()
            if (answer && peer.current) {
              await peer.current.setLocalDescription(answer)
              sendSignal({ type: 'answer', data: answer })
            }
            const candidates = pendingCandidates.current.splice(0)
            await Promise.all(candidates.map((candidate) => peer.current?.addIceCandidate(candidate)))
          }
          if (message.type === 'answer' && message.data) {
            await peer.current?.setRemoteDescription(message.data as RTCSessionDescriptionInit)
            const candidates = pendingCandidates.current.splice(0)
            await Promise.all(candidates.map((candidate) => peer.current?.addIceCandidate(candidate)))
          }
          if (message.type === 'candidate' && message.data) {
            if (peer.current?.remoteDescription) await peer.current.addIceCandidate(message.data as RTCIceCandidateInit)
            else pendingCandidates.current.push(message.data as RTCIceCandidateInit)
          }
          if (message.type === 'peer-left') setStatus('The other participant left the call.')
        } catch {
          setStatus('Unable to establish the video connection. Please try again.')
        }
      }
      socket.current.onerror = () => setStatus('Video signaling connection failed.')
      socket.current.onclose = () => setStatus('Call ended')
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
    if (remoteVideo.current) remoteVideo.current.srcObject = null
    remoteStream.current = null
    setActive(false)
    setStatus('Call ended')
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
      <p className="muted">{status}</p>
      {!active ? (
        !withinWindow ? (
          <p className="muted">Video calling is available only from {startTime} to {endTime} on {date}.</p>
        ) : (
        <button type="button" className="button primary" onClick={startCall}>Start video call</button>
        )
      ) : (
        <>
          <div className="video-grid">
            <video ref={remoteVideo} autoPlay playsInline onLoadedMetadata={(event) => void event.currentTarget.play().catch(() => undefined)} className="remote-video" />
          </div>
          <button type="button" className="button secondary" onClick={endCall}>End call</button>
        </>
      )}
    </div>
  )
}
