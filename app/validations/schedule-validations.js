const { z } = require('zod')
const { 
  parseISO, 
  addDays, 
  isAfter,
  startOfDay,
  isSameDay
} = require('date-fns')

// Shared schemas
const timeSlotSchema = z.array(z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/))
const scheduleSchema = z.record(z.string().datetime(), timeSlotSchema)

// Create schedule schema
const createRequestSchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  schedule: scheduleSchema
})

// Extend schedule schema
const extendRequestSchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  schedule: scheduleSchema
})

function validateScheduleCreate(data) {
  const validationErrors = []

  // First validate schema
  const validationResult = createRequestSchema.safeParse(data)
  if (!validationResult.success) {
    return {
      success: false,
      errors: validationResult.error.issues.map(issue => ({
        path: issue.path.join('.'),
        message: issue.message
      }))
    }
  }

  const { startDate, endDate, schedule } = validationResult.data

  // Parse dates
  const parsedStartDate = parseISO(startDate)
  const parsedEndDate = parseISO(endDate)
  const today = startOfDay(new Date())

  // Validate dates are in the future
  if (!isAfter(parsedStartDate, today)) {
    validationErrors.push({
      path: 'startDate',
      message: 'Start date must be in the future'
    })
  }

  if (!isAfter(parsedEndDate, today)) {
    validationErrors.push({
      path: 'endDate',
      message: 'End date must be in the future'
    })
  }

  // Validate end date is not before start date
  if (!isAfter(parsedEndDate, parsedStartDate)) {
    validationErrors.push({
      path: 'dateRange',
      message: 'End date must be after start date'
    })
  }

  // Validate schedule entries
  const scheduleDates = Object.keys(schedule)
    .map(date => parseISO(date))
    .sort((a, b) => a.getTime() - b.getTime())
  
  // Check for empty days
  if (scheduleDates.length === 0) {
    validationErrors.push({
      path: 'schedule',
      message: 'Schedule cannot be empty'
    })
  }

  // Validate sequential dates without gaps
  for (let i = 0; i < scheduleDates.length - 1; i++) {
    const currentDate = scheduleDates[i]
    const nextDate = scheduleDates[i + 1]
    const expectedNextDate = addDays(currentDate, 1)

    if (!isSameDay(nextDate, expectedNextDate)) {
      validationErrors.push({
        path: 'schedule',
        message: 'Schedule dates must be sequential without gaps'
      })
      break
    }
  }

  // Validate ordered times within each day
  Object.entries(schedule).forEach(([date, timeSlots]) => {
    // Check for empty time slots
    if (timeSlots.length === 0) {
      validationErrors.push({
        path: `schedule.${date}`,
        message: 'Day cannot have empty time slots'
      })
      return
    }

    // Check time slots are ordered
    for (let i = 0; i < timeSlots.length - 1; i++) {
      if (timeSlots[i] >= timeSlots[i + 1]) {
        validationErrors.push({
          path: `schedule.${date}`,
          message: 'Time slots must be in ascending order'
        })
        break
      }
    }
  })

  return {
    success: validationErrors.length === 0,
    errors: validationErrors,
    data: validationErrors.length === 0 ? validationResult.data : null
  }
}

function validateScheduleExtend(data) {
  const validationErrors = []

  // First validate schema
  const validationResult = extendRequestSchema.safeParse(data)
  if (!validationResult.success) {
    return {
      success: false,
      errors: validationResult.error.issues.map(issue => ({
        path: issue.path.join('.'),
        message: issue.message
      }))
    }
  }

  const { startDate, endDate, schedule } = validationResult.data

  // Parse dates
  const parsedStartDate = parseISO(startDate)
  const parsedEndDate = parseISO(endDate)
  const today = startOfDay(new Date())

  // Validate dates are in the future
  if (!isAfter(parsedStartDate, today)) {
    validationErrors.push({
      path: 'startDate',
      message: 'Start date must be in the future'
    })
  }

  if (!isAfter(parsedEndDate, today)) {
    validationErrors.push({
      path: 'endDate',
      message: 'End date must be in the future'
    })
  }

  // Validate end date is not before start date
  if (!isAfter(parsedEndDate, parsedStartDate)) {
    validationErrors.push({
      path: 'dateRange',
      message: 'End date must be after start date'
    })
  }

  // Validate schedule entries
  const scheduleDates = Object.keys(schedule)
    .map(date => parseISO(date))
    .sort((a, b) => a.getTime() - b.getTime())
  
  // Check for empty days
  if (scheduleDates.length === 0) {
    validationErrors.push({
      path: 'schedule',
      message: 'Schedule cannot be empty'
    })
  }

  // Validate sequential dates without gaps
  for (let i = 0; i < scheduleDates.length - 1; i++) {
    const currentDate = scheduleDates[i]
    const nextDate = scheduleDates[i + 1]
    const expectedNextDate = addDays(currentDate, 1)

    if (!isSameDay(nextDate, expectedNextDate)) {
      validationErrors.push({
        path: 'schedule',
        message: 'Schedule dates must be sequential without gaps'
      })
      break
    }
  }

  // Validate ordered times within each day
  Object.entries(schedule).forEach(([date, timeSlots]) => {
    // Check for empty time slots
    if (timeSlots.length === 0) {
      validationErrors.push({
        path: `schedule.${date}`,
        message: 'Day cannot have empty time slots'
      })
      return
    }

    // Check time slots are ordered
    for (let i = 0; i < timeSlots.length - 1; i++) {
      if (timeSlots[i] >= timeSlots[i + 1]) {
        validationErrors.push({
          path: `schedule.${date}`,
          message: 'Time slots must be in ascending order'
        })
        break
      }
    }
  })

  return {
    success: validationErrors.length === 0,
    errors: validationErrors,
    data: validationErrors.length === 0 ? validationResult.data : null
  }
}

module.exports = {
  validateScheduleCreate,
  validateScheduleExtend,
  createRequestSchema,
  extendRequestSchema
} 