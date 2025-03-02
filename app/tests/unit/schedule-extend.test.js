const { validateScheduleExtend } = require('../../validations/schedule-validations')
const { addDays, subDays, format } = require('date-fns')

describe('Schedule Validation Tests', () => {
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
          [futureDateStr]: ['09:00', '10:00']
        }
      }
      const result = validateScheduleExtend(validSchedule)
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    test('should reject invalid time format', () => {
      const invalidSchedule = {
        startDate: futureDateStr,
        endDate: nextDayStr,
        schedule: {
          [futureDateStr]: ['9:00', '10:00'] // missing leading zero
        }
      }
      const result = validateScheduleExtend(invalidSchedule)
      expect(result.success).toBe(false)
      expect(result.errors[0].message).toContain('Invalid')
    })

    test('should reject missing required fields', () => {
      const invalidSchedule = {
        startDate: futureDateStr
        // missing endDate and schedule
      }
      const result = validateScheduleExtend(invalidSchedule)
      expect(result.success).toBe(false)
      expect(result.errors).toHaveLength(2) // endDate and schedule are required
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
      const result = validateScheduleExtend(scheduleWithPastDate)
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
      const result = validateScheduleExtend(scheduleWithInvalidDateRange)
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
      const result = validateScheduleExtend(emptySchedule)
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
          // missing day in between
        }
      }
      const result = validateScheduleExtend(scheduleWithGap)
      expect(result.success).toBe(false)
      expect(result.errors[0].message).toBe('Schedule dates must be sequential without gaps')
    })

    test('should reject unordered time slots', () => {
      const scheduleWithUnorderedSlots = {
        startDate: futureDateStr,
        endDate: nextDayStr,
        schedule: {
          [futureDateStr]: ['10:00', '09:00'] // unordered times
        }
      }
      const result = validateScheduleExtend(scheduleWithUnorderedSlots)
      expect(result.success).toBe(false)
      expect(result.errors[0].message).toBe('Time slots must be in ascending order')
    })

    test('should reject empty time slots', () => {
      const scheduleWithEmptySlots = {
        startDate: futureDateStr,
        endDate: nextDayStr,
        schedule: {
          [futureDateStr]: []
        }
      }
      const result = validateScheduleExtend(scheduleWithEmptySlots)
      expect(result.success).toBe(false)
      expect(result.errors[0].message).toBe('Day cannot have empty time slots')
    })
  })

  describe('Valid Schedule Patterns', () => {
    test('should accept valid sequential days', () => {
      const validSequentialSchedule = {
        startDate: futureDateStr,
        endDate: addDays(futureDate, 2).toISOString(),
        schedule: {
          [futureDateStr]: ['09:00', '10:00'],
          [addDays(futureDate, 1).toISOString()]: ['10:00', '11:00'],
          [addDays(futureDate, 2).toISOString()]: ['11:00', '12:00']
        }
      }
      const result = validateScheduleExtend(validSequentialSchedule)
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    test('should accept valid time slots in order', () => {
      const validTimeSlots = {
        startDate: futureDateStr,
        endDate: nextDayStr,
        schedule: {
          [futureDateStr]: ['09:00', '10:00', '11:00', '12:00']
        }
      }
      const result = validateScheduleExtend(validTimeSlots)
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
    })
  })
}) 