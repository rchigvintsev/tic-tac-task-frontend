import * as moment from 'moment';

import {WeekDay} from './week-day';
import {Month} from './month';

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
    return moment().startOf('days').toDate();
  }

  static endOfToday(): Date {
    return moment().endOf('days').toDate();
  }

  static tomorrow(): Date {
    return moment().add(1, 'days').toDate();
  }

  static tomorrowAt(hours: number, minutes: number): Date {
    return moment().add(1, 'days').set({hour: hours, minute: minutes}).toDate();
  }

  static startOfTomorrow(): Date {
    return moment().add(1, 'days').startOf('day').toDate();
  }

  static endOfTomorrow(): Date {
    return moment().add(1, 'days').endOf('day').toDate();
  }

  static nextWeek(dayOfWeek?: WeekDay): Date {
    let result = moment().add(1, 'weeks');
    if (dayOfWeek) {
      result = result.isoWeekday(dayOfWeek.dayNumber);
    }
    return result.toDate();
  }

  static nextWeekAt(hours: number, minutes: number, dayOfWeek?: WeekDay): Date {
    let result = moment().add(1, 'weeks');
    if (dayOfWeek) {
      result = result.isoWeekday(dayOfWeek.dayNumber);
    }
    return result.set({hour: hours, minute: minutes}).toDate();
  }

  static endOfWeek(): Date {
    return moment().add(1, 'week').endOf('day').toDate();
  }

  static nextMonth(dayOfMonth?: number): Date {
    let result = moment().add(1, 'months');
    if (dayOfMonth) {
      result = result.date(Math.min(result.daysInMonth(), dayOfMonth));
    }
    return result.toDate();
  }

  static nextMonthAt(hours: number, minutes: number, dayOfMonth?: number): Date {
    let result = moment().add(1, 'months');
    if (dayOfMonth) {
      result = result.date(Math.min(result.daysInMonth(), dayOfMonth));
    }
    return result.set({hour: hours, minute: minutes}).toDate();
  }

  static nextYear(month?: Month, dayOfMonth?: number): Date {
    let result = moment().add(1, 'years');
    if (month) {
      result = result.month(month.monthNumber - 1);
    }
    if (dayOfMonth) {
      result = result.date(Math.min(result.daysInMonth(), dayOfMonth));
    }
    return result.toDate();
  }

  static nextYearAt(hours: number, minutes: number, month?: Month, dayOfMonth?: number): Date {
    let result = moment().add(1, 'years');
    if (month) {
      result = result.month(month.monthNumber - 1);
    }
    if (dayOfMonth) {
      result = result.date(Math.min(result.daysInMonth(), dayOfMonth));
    }
    return result.set({hour: hours, minute: minutes}).toDate();
  }
}
