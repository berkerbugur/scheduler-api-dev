import { BasePolicy } from './BasePolicy.js';
import { ValidationError } from './errors/ValidationError.js';

/**
 * Policy for validating schedule autocomplete operations
 * @extends BasePolicy
 */
export class ScheduleAutocompletePolicy extends BasePolicy {
  /**
   * Validates a schedule for autocomplete operation
   * @param {Object} schedule - The schedule to validate
   * @param {Object} [options] - Additional validation options
   * @param {boolean} [options.checkEligibility=true] - Whether to check autocomplete eligibility
   * @returns {Object} Validation result
   * @throws {ValidationError} If validation fails
   */
  static validate(schedule, options = { checkEligibility: true }) {
    super.validate(schedule);
    const errors = [];

    this.validateForAutocomplete(schedule, options, errors);

    return {
      isValid: true,
      data: schedule,
      pattern: this.findFirstDayPattern(schedule)
    };
  }

  static validateForAutocomplete(schedule, options, errors) {
    if (!this.hasValidPattern(schedule, errors)) {
      throw new ValidationError('Pattern validation failed', errors);
    }

    if (options.checkEligibility && !this.isEligibleForAutocomplete(schedule, errors)) {
      throw new ValidationError('Autocomplete eligibility check failed', errors);
    }
  }

  static hasValidPattern(schedule, errors) {
    const hasPattern = schedule.days.some(day => this.isDayWithTimes(day));
    
    if (!hasPattern) {
      errors.push('At least one day must have times set to use autocomplete');
    }

    return hasPattern;
  }

  static isEligibleForAutocomplete(schedule, errors) {
    return true;
  }

  static findFirstDayPattern(schedule) {
    const firstDayWithTimes = schedule.days.find(day => this.isDayWithTimes(day));
    return firstDayWithTimes ? firstDayWithTimes.times : [];
  }

  static isDayWithTimes(day) {
    return day.times && day.times.length > 0;
  }
} 