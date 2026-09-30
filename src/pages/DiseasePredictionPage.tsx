import { useEffect, useState, type FormEvent } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import { api } from '../api'
import { Localized } from '../Language'

type PredictionOptions = {
  animals: string[]
  symptoms: string[]
}

type DiseaseMatch = {
  disease: string
  confidence: number
  matchingExamples: number
}

type PredictionResult = {
  predictions: DiseaseMatch[]
}

export default function DiseasePredictionPage() {
  const [options, setOptions] = useState<PredictionOptions>({ animals: [], symptoms: [] })
  const [animalType, setAnimalType] = useState('')
  const [symptoms, setSymptoms] = useState<string[]>([])
  const [result, setResult] = useState<PredictionResult | null>(null)
  const [loadingOptions, setLoadingOptions] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get<PredictionOptions>('/disease-predictions/options')
      .then(({ data }) => {
        setOptions(data)
        setAnimalType(data.animals[0] ?? '')
      })
      .catch(() => setError('Could not load the available animals and symptoms. Please try again.'))
      .finally(() => setLoadingOptions(false))
  }, [])

  const toggleSymptom = (symptom: string) => {
    setSymptoms((selected) => selected.includes(symptom)
      ? selected.filter((item) => item !== symptom)
      : [...selected, symptom])
    setResult(null)
  }

  const submitPrediction = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setResult(null)
    setSubmitting(true)

    try {
      const response = await api.post<PredictionResult>('/disease-predictions/predict', {
        animalType,
        symptoms,
      })
      setResult(response.data)
    } catch (requestError: unknown) {
      const message = axios.isAxiosError<{ message: string }>(requestError)
        ? requestError.response?.data?.message
        : undefined
      setError(message ?? 'Prediction could not be completed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="page shell">
      <Localized>
      <header className="topbar">
        <div className="brand">AniCare</div>
        <Link to="/farmer">Farmer home</Link>
      </header>

      <section className="card prediction-intro">
        <span className="pill">Animal health</span>
        <h1>Disease symptom checker</h1>
        <p className="muted">Choose the animal and signs you have observed to see the closest matches in our reference dataset.</p>
      </section>

      <section className="card" style={{ marginTop: 18 }}>
        {loadingOptions ? <p className="muted">Loading symptom list...</p> : (
          <form className="prediction-form" onSubmit={submitPrediction}>
            <label>
              Animal
              <select value={animalType} onChange={(event) => {
                setAnimalType(event.target.value)
                setResult(null)
              }} required>
                {options.animals.map((animal) => <option key={animal} value={animal}>{animal}</option>)}
              </select>
            </label>

            <fieldset>
              <legend>Observed symptoms ({symptoms.length} selected)</legend>
              {options.symptoms.length === 0 ? <p className="muted">No symptoms are available right now.</p> : (
                <div className="symptom-list">
                  {options.symptoms.map((symptom) => (
                    <label className="symptom-option" key={symptom}>
                      <input
                        type="checkbox"
                        checked={symptoms.includes(symptom)}
                        onChange={() => toggleSymptom(symptom)}
                      />
                      <span>{symptom}</span>
                    </label>
                  ))}
                </div>
              )}
            </fieldset>

            {error && <p className="error" role="alert">{error}</p>}
            <button className="button primary" type="submit" disabled={submitting || !animalType || symptoms.length === 0}>
              {submitting ? 'Checking matches...' : 'Check likely matches'}
            </button>
          </form>
        )}
      </section>

      {result && (
        <section className="card prediction-result" aria-live="polite">
          <h2>Closest dataset matches</h2>
          <p className="muted">Scores compare your selected signs with similar animal records.</p>
          {result.predictions.length === 0 ? <p>No close matches were found. A veterinarian can assess symptoms not covered by this dataset.</p> : (
            <div className="prediction-result-list">
              {result.predictions.map((match) => (
                <div className="prediction-candidate" key={match.disease}>
                  <div>
                    <strong>{match.disease}</strong>
                    <div className="muted">{match.matchingExamples} similar dataset record{match.matchingExamples === 1 ? '' : 's'}</div>
                  </div>
                  <span className="prediction-score">{match.confidence}% match</span>
                </div>
              ))}
            </div>
          )}
          <p className="prediction-disclaimer">This is an experimental dataset match, not a diagnosis or a validated probability. The reference data is limited; contact a veterinarian for assessment, especially if symptoms are severe or worsening.</p>
        </section>
      )}
      </Localized>
    </main>
  )
}