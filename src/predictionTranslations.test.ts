import { describe, expect, it } from 'vitest'
import {
  formatMatchScore,
  formatMatchingExamples,
  formatSelectedSymptoms,
  translatePredictionText,
} from './predictionTranslations'

describe('prediction translations', () => {
  it('translates animal and symptom labels without changing English mode', () => {
    expect(translatePredictionText('Cow', 'hi')).toBe('गाय')
    expect(translatePredictionText('Fever', 'mr')).toBe('ताप')
    expect(translatePredictionText('Cow', 'en')).toBeUndefined()
  })

  it('translates dataset disease names for display', () => {
    expect(translatePredictionText('Canine Parvovirus', 'hi')).toBe('कुत्तों का पार्वोवायरस')
    expect(translatePredictionText('Bovine Mastitis', 'mr')).toBe('गोवंशीय स्तनदाह')
  })

  it('formats dynamic counts and match scores in the selected language', () => {
    expect(translatePredictionText('Observed symptoms (2 selected)', 'mr')).toBe('दिसलेली लक्षणे (2 निवडली)')
    expect(translatePredictionText('3 similar dataset records', 'hi')).toBe('3 मिलते-जुलते डेटासेट रिकॉर्ड')
    expect(translatePredictionText('84% match', 'mr')).toBe('84% जुळणी')
    expect(formatSelectedSymptoms(2, 'hi')).toBe('देखे गए लक्षण (2 चुने गए)')
    expect(formatMatchingExamples(1, 'mr')).toBe('1 समान डेटासेट नोंदी')
    expect(formatMatchScore(84, 'hi')).toBe('84% मिलान')
  })

  it('leaves unrelated and unknown text unchanged', () => {
    expect(translatePredictionText('Uncatalogued phrase', 'hi')).toBeUndefined()
  })
})
