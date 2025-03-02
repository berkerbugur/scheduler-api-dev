export class DateUtils {
  static TIME_FORMAT = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  static MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24;
  
  static timeToMinutes(time) {
    if (this.isInvalidTimeFormat(time)) {
      throw new Error(`Invalid time format: ${time}. Expected HH:mm`);
    }
    
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  static daysBetween(startDate, endDate) {
    const timeDifference = endDate.getTime() - startDate.getTime();
    return Math.floor(timeDifference / this.MILLISECONDS_PER_DAY) + 1;
  }

  static isFutureDate(date) {
    const today = this.getStartOfDay(new Date());
    return date > today;
  }

  static isValidDateString(dateString) {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
  }

  static getStartOfDay(date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    return startOfDay;
  }

  static isInvalidTimeFormat(time) {
    return !time || !time.match(this.TIME_FORMAT);
  }
} 