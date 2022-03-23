import * as moment from 'moment';

export class DateTimeUtils {
  private constructor() {
  }

  static parseDate(input: any): Date {
    return input ? moment(input, moment.HTML5_FMT.DATE).toDate() : null;
  }

  static parseDateTime(input: any): Date {
    return input ? moment.utc(input, moment.HTML5_FMT.DATETIME_LOCAL).local().toDate() : null;
  }

  static formatDate(date: Date): string {
    return date ? moment(date).format(moment.HTML5_FMT.DATE) : null;
  }

  static formatTime(date: Date): string {
    return date ? moment(date).format(moment.HTML5_FMT.TIME) : null;
  }

  static formatDateTime(dateTime: Date): string {
    return dateTime ? moment(dateTime).utc().format(moment.HTML5_FMT.DATETIME_LOCAL) : null;
  }

  static weekDay(): number {
    return moment().isoWeekday();
  }

  static today(): Date {
    return moment().toDate();
  }

  static startOfToday(): Date {
    return moment().startOf('day').toDate();
  }

  static endOfToday(): Date {
    return moment().endOf('day').toDate();
  }

  static tomorrow(): Date {
    return moment().add(1, 'day').toDate();
  }

  static startOfTomorrow(): Date {
    return moment().add(1, 'day').startOf('day').toDate();
  }

  static endOfTomorrow(): Date {
    return moment().add(1, 'day').endOf('day').toDate();
  }

  static endOfWeek(): Date {
    return moment().add(1, 'week').endOf('day').toDate();
  }
}
