import { Router } from 'express'
import { z } from 'zod'
import { getPredictionOptions, isSupportedAnimal, predictDisease } from '../diseasePrediction.js'
import { requireAuth, requireRole } from '../middleware/auth.js'

const router = Router()

router.use(requireAuth, requireRole('FARMER'))

router.get('/options', (_req, res) => {
  return res.json(getPredictionOptions())
})

router.post('/predict', (req, res) => {
  const parsed = z.object({
    animalType: z.string().min(1),
    symptoms: z.array(z.string().min(1)).min(1).max(20),
  }).safeParse(req.body)

  if (!parsed.success || !isSupportedAnimal(parsed.data.animalType)) {
    return res.status(400).json({ message: 'Choose a supported animal and at least one symptom.' })
  }

  return res.json({ predictions: predictDisease(parsed.data.animalType, parsed.data.symptoms) })
})

export default router