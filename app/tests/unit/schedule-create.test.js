const { validateScheduleCreate } = require('../../validations/schedule-validations')
const { addDays, subDays } = require('date-fns')

describe('Create Schedule Validation Tests', () => {
  const today = new Date()
  const futureDate = addDays(today, 5)
  const futureDateStr = futureDate.toISOString()
  const nextDayStr = addDays(futureDate, 1).toISOString()
  const pastDateStr = subDays(today, 1).toISOString()

  describe('Basic Schema Validation', () => {
    test('should validate a correct schedule format', () => {
      const validSchedule = {
        startDate: futureDateStr,
        endDate: nextDayStr,
        schedule: {
          [futureDateStr]: ['09:00', '10:00'],
          [nextDayStr]: ['10:00', '11:00']
        }
      }
      const result = validateScheduleCreate(validSchedule)
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.data).toEqual(validSchedule)
    })

    test('should reject invalid time format', () => {
      const invalidSchedule = {
        startDate: futureDateStr,
        endDate: nextDayStr,
        schedule: {
          [futureDateStr]: ['9:00', '10:00'] // missing leading zero
        }
      }
      const result = validateScheduleCreate(invalidSchedule)
      expect(result.success).toBe(false)
      expect(result.errors[0].message).toContain('Invalid')
    })

    test('should reject missing required fields', () => {
      const invalidSchedule = {
        startDate: futureDateStr
        // missing endDate and schedule
      }
      const result = validateScheduleCreate(invalidSchedule)
      expect(result.success).toBe(false)
      expect(result.errors).toHaveLength(2)
    })
  })

  describe('Date Validation', () => {
    test('should reject past dates', () => {
      const scheduleWithPastDate = {
        startDate: pastDateStr,
        endDate: futureDateStr,
        schedule: {
          [futureDateStr]: ['09:00', '10:00']
        }
      }
      const result = validateScheduleCreate(scheduleWithPastDate)
      expect(result.success).toBe(false)
      expect(result.errors[0].message).toBe('Start date must be in the future')
    })

    test('should reject end date before start date', () => {
      const scheduleWithInvalidDateRange = {
        startDate: nextDayStr,
        endDate: futureDateStr,
        schedule: {
          [futureDateStr]: ['09:00', '10:00']
        }
      }
      const result = validateScheduleCreate(scheduleWithInvalidDateRange)
      expect(result.success).toBe(false)
      expect(result.errors[0].message).toBe('End date must be after start date')
    })
  })

  describe('Schedule Pattern Validation', () => {
    test('should reject empty schedule', () => {
      const emptySchedule = {
        startDate: futureDateStr,
        endDate: nextDayStr,
        schedule: {}
      }
      const result = validateScheduleCreate(emptySchedule)
      expect(result.success).toBe(false)
      expect(result.errors[0].message).toBe('Schedule cannot be empty')
    })

    test('should reject schedule with gaps', () => {
      const scheduleWithGap = {
        startDate: futureDateStr,
        endDate: addDays(futureDate, 3).toISOString(),
        schedule: {
          [futureDateStr]: ['09:00', '10:00'],
          [addDays(futureDate, 2).toISOString()]: ['09:00', '10:00']
        }
      }
      const result = validateScheduleCreate(scheduleWithGap)
      expect(result.success).toBe(false)
      expect(result.errors[0].message).toBe('Schedule dates must be sequential without gaps')
    })

    test('should reject unordered time slots', () => {
      const scheduleWithUnorderedSlots = {
        startDate: futureDateStr,
        endDate: nextDayStr,
        schedule: {
          [futureDateStr]: ['10:00', '09:00']
        }
      }
      const result = validateScheduleCreate(scheduleWithUnorderedSlots)
      expect(result.success).toBe(false)
      expect(result.errors[0].message).toBe('Time slots must be in ascending order')
    })
  })

  describe('Valid Schedule Creation', () => {
    test('should accept valid sequential days with multiple time slots', () => {
      const validSchedule = {
        startDate: futureDateStr,
        endDate: addDays(futureDate, 2).toISOString(),
        schedule: {
          [futureDateStr]: ['09:00', '10:00', '11:00'],
          [addDays(futureDate, 1).toISOString()]: ['09:00', '10:00'],
          [addDays(futureDate, 2).toISOString()]: ['14:00', '15:00', '16:00']
        }
      }
      const result = validateScheduleCreate(validSchedule)
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.data).toEqual(validSchedule)
    })
  })
}) 