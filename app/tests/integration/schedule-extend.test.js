const request = require('supertest')
const express = require('express')
const { router } = require('../../router/router')
const { addDays, subDays } = require('date-fns')

describe('Schedule Router Integration Tests', () => {
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

  describe('PUT /api/v1/schedule/extend', () => {
    test('should extend schedule successfully', async () => {
      const validRequest = {
        startDate: futureDateStr,
        endDate: addDays(futureDate, 2).toISOString(),
        schedule: {
          [futureDateStr]: ['09:00', '10:00']
        }
      }

      const response = await request(app)
        .put('/api/v1/schedule/extend')
        .send(validRequest)
        .expect('Content-Type', /json/)
        .expect(200)

      expect(response.body.validationErrors).toHaveLength(0)
      expect(response.body.data).toBeDefined()
      expect(Object.keys(response.body.data)).toHaveLength(3) // 3 days of schedule
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
        .put('/api/v1/schedule/extend')
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
        .put('/api/v1/schedule/extend')
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
        .put('/api/v1/schedule/extend')
        .send(invalidRequest)
        .expect('Content-Type', /json/)
        .expect(400)

      expect(response.body.validationErrors[0].message).toBe('Schedule dates must be sequential without gaps')
    })

    test('should extend schedule with pattern repetition', async () => {
      const validRequest = {
        startDate: futureDateStr,
        endDate: addDays(futureDate, 3).toISOString(),
        schedule: {
          [futureDateStr]: ['09:00', '10:00'],
          [addDays(futureDate, 1).toISOString()]: ['10:00', '11:00']
        }
      }

      const response = await request(app)
        .put('/api/v1/schedule/extend')
        .send(validRequest)
        .expect('Content-Type', /json/)
        .expect(200)

      expect(response.body.validationErrors).toHaveLength(0)
      expect(Object.keys(response.body.data)).toHaveLength(4) // 4 days of schedule
      
      // Verify pattern repetition
      const schedules = Object.values(response.body.data)
      expect(schedules[0]).toEqual(['09:00', '10:00'])
      expect(schedules[1]).toEqual(['10:00', '11:00'])
      expect(schedules[2]).toEqual(['09:00', '10:00']) // Pattern repeats
      expect(schedules[3]).toEqual(['10:00', '11:00']) // Pattern repeats
    })

    test('should handle malformed JSON', async () => {
      const response = await request(app)
        .put('/api/v1/schedule/extend')
        .send('{"malformed json')
        .expect('Content-Type', /json/)
        .expect(400)

      expect(response.body.validationErrors).toBeDefined()
    })
  })
}) 