import { ValidationError } from './errors/ValidationError.js';
import { DateUtils } from './utils/dateUtils.js';

export class BasePolicy {
  static validate(schedule) {
    const errors = [];

    try {
      this.validateAll(schedule, errors);
      this.throwIfErrors(errors);
      return this.createSuccessResult(schedule);
    } catch (error) {
      this.handleValidationError(error);
    }
  }

  static validateAll(schedule, errors) {
    this.validateScheduleStructure(schedule, errors);
    this.validateDates(schedule, errors);
    this.validateDays(schedule, errors);
  }

  static validateScheduleStructure(schedule, errors) {
    if (this.isInvalidScheduleObject(schedule)) {
      errors.push('Schedule must be an object');
      return;
    }

    this.validateRequiredFields(schedule, errors);
  }

  static validateDates(schedule, errors) {
    const startDate = new Date(schedule.startDate);
    const endDate = new Date(schedule.endDate);

    this.validateDateRange(startDate, endDate, errors);
    this.validateDaysCount(schedule, startDate, endDate, errors);
  }

  static validateDays(schedule, errors) {
    if (!Array.isArray(schedule.days)) return;

    schedule.days.forEach((day, index) => {
      this.validateDayTimes(day, index, errors);
    });
  }

  static validateDayTimes(day, dayIndex, errors) {
    if (this.isEmptyDay(day)) {
      errors.push(`Day ${dayIndex + 1} must have times`);
      return;
    }

    if (day.times.length > 1) {
      this.validateTimeOrder(day.times, dayIndex, errors);
    }
  }

  static validateTimeOrder(times, dayIndex, errors) {
    try {
      this.checkTimeSequence(times, dayIndex, errors);
    } catch (error) {
      errors.push(`Invalid time format in day ${dayIndex + 1}: ${error.message}`);
    }
  }

  static checkTimeSequence(times, dayIndex, errors) {
    for (let i = 1; i < times.length; i++) {
      const prevTime = DateUtils.timeToMinutes(times[i - 1]);
      const currentTime = DateUtils.timeToMinutes(times[i]);
      
      if (currentTime <= prevTime) {
        errors.push(`Times must be ordered on day ${dayIndex + 1}`);
        break;
      }
    }
  }

  static validateRequiredFields(schedule, errors) {
    if (!this.isValidStartDate(schedule)) {
      errors.push('Invalid or missing start date');
    }

    if (!this.isValidEndDate(schedule)) {
      errors.push('Invalid or missing end date');
    }

    if (!Array.isArray(schedule.days)) {
      errors.push('Schedule days must be an array');
    }
  }

  static validateDateRange(startDate, endDate, errors) {
    if (!DateUtils.isFutureDate(startDate)) {
      errors.push('Start date must be in the future');
    }

    if (!DateUtils.isFutureDate(endDate)) {
      errors.push('End date must be in the future');
    }

    if (endDate < startDate) {
      errors.push('End date cannot be before start date');
    }
  }

  static validateDaysCount(schedule, startDate, endDate, errors) {
    const expectedDays = DateUtils.daysBetween(startDate, endDate);
    if (schedule.days.length !== expectedDays) {
      errors.push(`Number of days (${schedule.days.length}) does not match the time frame (${expectedDays} days)`);
    }
  }

  static isInvalidScheduleObject(schedule) {
    return !schedule || typeof schedule !== 'object';
  }

  static isValidStartDate(schedule) {
    return schedule.startDate && DateUtils.isValidDateString(schedule.startDate);
  }

  static isValidEndDate(schedule) {
    return schedule.endDate && DateUtils.isValidDateString(schedule.endDate);
  }

  static isEmptyDay(day) {
    return !day.times || day.times.length === 0;
  }

  static throwIfErrors(errors) {
    if (errors.length > 0) {
      throw new ValidationError('Validation failed', errors);
    }
  }

  static createSuccessResult(schedule) {
    return { isValid: true, data: schedule };
  }

  static handleValidationError(error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    throw new ValidationError('Unexpected error', [error.message]);
  }
} 