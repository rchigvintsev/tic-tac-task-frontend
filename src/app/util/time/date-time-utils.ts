import * as moment from 'moment';

export class DateTimeUtils {
  private constructor() {
  }

  static weekDay(): number {
    return moment().isoWeekday();
  }

  static startOfToday(): Date {
    return moment().startOf('day').toDate();
  }

  static endOfToday(): Date {
    return moment().endOf('day').toDate();
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
