import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

type DatasetRow = Record<string, string>

export type DiseaseMatch = {
  disease: string
  confidence: number
  matchingExamples: number
}

const binarySymptoms: Record<string, string> = {
  Appetite_Loss: 'Appetite Loss',
  Vomiting: 'Vomiting',
  Diarrhea: 'Diarrhea',
  Coughing: 'Coughing',
  Labored_Breathing: 'Labored Breathing',
  Lameness: 'Lameness',
  Skin_Lesions: 'Skin Lesions',
  Nasal_Discharge: 'Nasal Discharge',
  Eye_Discharge: 'Eye Discharge',
}

const datasetPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../cleaned_animal_disease_prediction.csv')

function parseCsvLine(line: string): string[] {
  const values: string[] = []
  let value = ''
  let quoted = false

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index]
    if (character === '"' && line[index + 1] === '"' && quoted) {
      value += '"'
      index += 1
    } else if (character === '"') {
      quoted = !quoted
    } else if (character === ',' && !quoted) {
      values.push(value)
      value = ''
    } else {
      value += character
    }
  }

  values.push(value)
  return values
}

function normalizeSymptom(symptom: string): string {
  const normalized = symptom.toLowerCase().replace(/[_-]+/g, ' ').trim().replace(/\s+/g, ' ')
  return normalized === 'loss of appetite' ? 'appetite loss' : normalized
}

function loadDataset(): DatasetRow[] {
  const lines = readFileSync(datasetPath, 'utf8').replace(/^\uFEFF/, '').split(/\r?\n/).filter(Boolean)
  const headers = parseCsvLine(lines[0])

  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line)
    return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? '']))
  })
}

const dataset = loadDataset()

function rowSymptoms(row: DatasetRow): Set<string> {
  const symptoms = new Set<string>()
  for (const column of ['Symptom_1', 'Symptom_2', 'Symptom_3', 'Symptom_4']) {
    const symptom = row[column]?.trim()
    if (symptom && symptom.toLowerCase() !== 'no') symptoms.add(normalizeSymptom(symptom))
  }

  for (const [column, label] of Object.entries(binarySymptoms)) {
    if (row[column]?.toLowerCase() === 'yes') symptoms.add(normalizeSymptom(label))
  }
  return symptoms
}

const records = dataset.map((row) => ({
  animalType: row.Animal_Type,
  disease: row.Disease_Prediction,
  symptoms: rowSymptoms(row),
}))

export function getPredictionOptions() {
  const animals = [...new Set(records.map((record) => record.animalType))].sort()
  const symptomLabels = new Map<string, string>()

  for (const row of dataset) {
    for (const column of ['Symptom_1', 'Symptom_2', 'Symptom_3', 'Symptom_4']) {
      const symptom = row[column]?.trim()
      if (symptom && symptom.toLowerCase() !== 'no') {
        const key = normalizeSymptom(symptom)
        if (!symptomLabels.has(key)) symptomLabels.set(key, key === 'appetite loss' ? 'Appetite Loss' : symptom)
      }
    }
  }

  for (const label of Object.values(binarySymptoms)) {
    const key = normalizeSymptom(label)
    if (!symptomLabels.has(key)) symptomLabels.set(key, label)
  }

  return { animals, symptoms: [...symptomLabels.values()].sort((left, right) => left.localeCompare(right)) }
}

export function predictDisease(animalType: string, selectedSymptoms: string[]): DiseaseMatch[] {
  const normalizedAnimal = animalType.trim().toLowerCase()
  const symptoms = new Set(selectedSymptoms.map(normalizeSymptom))
  if (!normalizedAnimal || symptoms.size === 0) return []

  const nearest = records.filter((record) => record.animalType.toLowerCase() === normalizedAnimal).map((record) => {
    const intersection = [...symptoms].filter((symptom) => record.symptoms.has(symptom)).length
    if (intersection === 0) return null

    const union = new Set([...symptoms, ...record.symptoms]).size
    return { ...record, similarity: intersection / union }
  })
    .filter((record): record is NonNullable<typeof record> => record !== null)
    .sort((left, right) => right.similarity - left.similarity)
    .slice(0, 5)

  const diseaseScores = new Map<string, { score: number; matchingExamples: number }>()
  for (const record of nearest) {
    const current = diseaseScores.get(record.disease) ?? { score: 0, matchingExamples: 0 }
    current.score += record.similarity
    current.matchingExamples += 1
    diseaseScores.set(record.disease, current)
  }

  const totalScore = [...diseaseScores.values()].reduce((total, item) => total + item.score, 0)
  return [...diseaseScores.entries()]
    .map(([disease, item]) => ({
      disease,
      confidence: Math.round((item.score / totalScore) * 100),
      matchingExamples: item.matchingExamples,
    }))
    .sort((left, right) => right.confidence - left.confidence)
    .slice(0, 3)
}

export function isSupportedAnimal(animalType: string): boolean {
  return getPredictionOptions().animals.some((animal) => animal.toLowerCase() === animalType.trim().toLowerCase())
}