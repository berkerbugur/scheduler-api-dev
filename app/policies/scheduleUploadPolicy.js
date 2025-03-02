import { BasePolicy } from './BasePolicy.js';
import { ValidationError } from './errors/ValidationError.js';

export class ScheduleUploadPolicy extends BasePolicy {
  static validate(schedule, options = { checkModification: false }) {
    super.validate(schedule);

    const errors = [];

    this.validateForUpload(schedule, options, errors);

    return {
      isValid: true,
      data: schedule
    };
  }

  static validateForUpload(schedule, options, errors) {
    if (options.checkModification && !this.isUnmodified(schedule, errors)) {
      throw new ValidationError('Upload validation failed', errors);
    }
  }

  static isUnmodified(schedule, errors) {
    return true;
  }
} 