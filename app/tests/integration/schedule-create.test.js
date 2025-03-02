const request = require('supertest')
const express = require('express')
const { router } = require('../../router/router')
const { addDays, subDays } = require('date-fns')

describe('Schedule Create Integration Tests', () => {
  let app

  beforeEach(() => {
    app = express()
    app.use(express.json())
    app.use(router)
  })

  const today = new Date()
  const futureDate = addDays(today, 5)
  const futureDateStr = futureDate.toISOString()
  const nextDayStr = addDays(futureDate, 1).toISOString()

  describe('POST /api/v1/schedule/create', () => {
    test('should create schedule successfully', async () => {
      const validRequest = {
        startDate: futureDateStr,
        endDate: addDays(futureDate, 2).toISOString(),
        schedule: {
          [futureDateStr]: ['09:00', '10:00'],
          [nextDayStr]: ['10:00', '11:00'],
          [addDays(futureDate, 2).toISOString()]: ['11:00', '12:00']
        }
      }

      const response = await request(app)
        .post('/api/v1/schedule/create')
        .send(validRequest)
        .expect('Content-Type', /json/)
        .expect(201)

      expect(response.body.validationErrors).toHaveLength(0)
      expect(response.body.data).toBeDefined()
      expect(response.body.data.success).toBe(true)
    })

    test('should return 400 for invalid time format', async () => {
      const invalidRequest = {
        startDate: futureDateStr,
        endDate: nextDayStr,
        schedule: {
          [futureDateStr]: ['9:00', '10:00'] // missing leading zero
        }
      }

      const response = await request(app)
        .post('/api/v1/schedule/create')
        .send(invalidRequest)
        .expect('Content-Type', /json/)
        .expect(400)

      expect(response.body.validationErrors).toBeDefined()
      expect(response.body.validationErrors.length).toBeGreaterThan(0)
      expect(response.body.data).toBeNull()
    })

    test('should return 400 for past dates', async () => {
      const invalidRequest = {
        startDate: subDays(today, 1).toISOString(),
        endDate: futureDateStr,
        schedule: {
          [futureDateStr]: ['09:00', '10:00']
        }
      }

      const response = await request(app)
        .post('/api/v1/schedule/create')
        .send(invalidRequest)
        .expect('Content-Type', /json/)
        .expect(400)

      expect(response.body.validationErrors[0].message).toBe('Start date must be in the future')
    })

    test('should return 400 for schedule with gaps', async () => {
      const invalidRequest = {
        startDate: futureDateStr,
        endDate: addDays(futureDate, 2).toISOString(),
        schedule: {
          [futureDateStr]: ['09:00', '10:00'],
          [addDays(futureDate, 2).toISOString()]: ['09:00', '10:00']
        }
      }

      const response = await request(app)
        .post('/api/v1/schedule/create')
        .send(invalidRequest)
        .expect('Content-Type', /json/)
        .expect(400)

      expect(response.body.validationErrors[0].message).toBe('Schedule dates must be sequential without gaps')
    })

    test('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/api/v1/schedule/create')
        .send('{"malformed json')
        .expect('Content-Type', /json/)
        .expect(400)

      expect(response.body.validationErrors).toBeDefined()
    })
  })
}) 