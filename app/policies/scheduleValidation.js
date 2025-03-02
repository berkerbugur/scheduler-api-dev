class ScheduleValidationPolicy {
  static validate(schedule) {
    const errors = [];

    if (!this.validateDates(schedule, errors)) {
      return { isValid: false, errors };
    }

    if (!this.validateDays(schedule, errors)) {
      return { isValid: false, errors };
    }

    return { isValid: errors.length === 0, errors };
  }

  static validateDates(schedule, errors) {
    const startDate = new Date(schedule.startDate);
    const endDate = new Date(schedule.endDate);
    const now = new Date();

    if (startDate <= now) {
      errors.push('Start date must be in the future');
    }

    if (endDate <= now) {
      errors.push('End date must be in the future');
    }

    if (endDate < startDate) {
      errors.push('End date cannot be before start date');
    }

    const daysDiff = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    if (schedule.days.length !== daysDiff) {
      errors.push(`Number of days (${schedule.days.length}) does not match the time frame (${daysDiff} days)`);
    }

    return errors.length === 0;
  }

  static validateDays(schedule, errors) {
    const emptyDays = schedule.days.filter(day => !day.times || day.times.length === 0);
    if (emptyDays.length > 0) {
      errors.push('All days must have at least one time entry');
    }

    schedule.days.forEach((day, index) => {
      if (day.times && day.times.length > 1) {
        for (let i = 1; i < day.times.length; i++) {
          const prevTime = this.convertTimeToMinutes(day.times[i - 1]);
          const currentTime = this.convertTimeToMinutes(day.times[i]);
          
          if (currentTime <= prevTime) {
            errors.push(`Times must be in ascending order for day ${index + 1}`);
            break;
          }
        }
      }
    });

    return errors.length === 0;
  }

  static convertTimeToMinutes(time) {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }
}

module.exports = { ScheduleValidationPolicy }; 