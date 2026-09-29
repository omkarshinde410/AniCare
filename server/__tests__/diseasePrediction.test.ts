import { describe, expect, it } from 'vitest'
import { getPredictionOptions, predictDisease } from '../diseasePrediction.js'

describe('disease symptom matching', () => {
  it('ranks the dataset disease for a known animal and symptom profile', () => {
    const matches = predictDisease('Dog', ['Fever', 'Lethargy', 'Appetite Loss', 'Vomiting'])

    expect(matches[0]?.disease).toBe('Parvovirus')
    expect(matches[0]?.confidence).toBeGreaterThan(0)
    expect(matches[0]?.confidence).toBeLessThanOrEqual(100)
  })

  it('returns available animals and symptoms from the bundled data', () => {
    const options = getPredictionOptions()

    expect(options.animals).toContain('Dog')
    expect(options.symptoms).toContain('Fever')
  })

  it('does not invent a match when none of the symptoms occur in the dataset', () => {
    expect(predictDisease('Dog', ['unlisted symptom'])).toEqual([])
  })
})