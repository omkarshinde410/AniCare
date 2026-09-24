import { describe, it, expect, beforeAll } from 'vitest'
import request from 'supertest'
import app from '../index.js'

beforeAll(() => {
  process.env.NODE_ENV = 'test'
})

describe('AniCare auth API', () => {
  it('registers a farmer and logs in', async () => {
    const email = `farmer_${Date.now()}@test.com`

    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        fullName: 'Demo Farmer',
        email,
        password: 'secret123',
        role: 'FARMER',
      })

    expect(registerResponse.status).toBe(201)

    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email,
        password: 'secret123',
      })

    expect(loginResponse.status).toBe(200)
    expect(loginResponse.body.user.role).toBe('FARMER')
    expect(loginResponse.body.token).toBeTruthy()
  })

  it('prevents unauthorized access to protected routes', async () => {
    const response = await request(app).get('/api/doctors/pending')
    expect(response.status).toBe(401)
  })
})
