import * as moment from 'moment';

export class Dates {
  private constructor() {
  }

  static endOfToday(): Date {
    return moment().endOf('day').toDate();
  }

  static endOfTomorrow(): Date {
    return moment().add(1, 'day').endOf('day').toDate();
  }

  static endOfWeek(): Date {
    return moment().add(1, 'week').endOf('day').toDate();
  }
}
