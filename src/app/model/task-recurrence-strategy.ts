import {Serializable} from './serializable';
import {Month} from '../util/time/month';
import {WeekDay} from '../util/time/week-day';
import {Task} from './task';
import {Assert} from '../util/assert';
import moment from 'moment';
import {DateTimeUtils} from '../util/time/date-time-utils';

export abstract class TaskRecurrenceStrategy implements Serializable {
  static create(input: any): TaskRecurrenceStrategy {
    switch (input.type) {
      case 'daily':
        return new DailyTaskRecurrenceStrategy().deserialize(input);
      case 'weekly':
        return new WeeklyTaskRecurrenceStrategy().deserialize(input);
      case 'monthly':
        return new MonthlyTaskRecurrenceStrategy().deserialize(input);
      case 'annually':
        return new AnnuallyTaskRecurrenceStrategy().deserialize(input);
      default:
        throw new Error('Unsupported task recurrence type: ' + input.type);
    }
  }

  abstract getType(): string;

  abstract deserialize(input: any): TaskRecurrenceStrategy;

  abstract serialize(): any;

  reschedule(task: Task) {
    Assert.notNullOrUndefined(task, 'Task to reschedule must not be null or undefined');
    this.doReschedule(task);
  }

  protected abstract doReschedule(task: Task);
}

export class DailyTaskRecurrenceStrategy extends TaskRecurrenceStrategy {
  static readonly TYPE = 'daily';

  getType(): string {
    return DailyTaskRecurrenceStrategy.TYPE;
  }

  deserialize(input: any): DailyTaskRecurrenceStrategy {
    return this;
  }

  serialize(): any {
    return {type: this.getType()};
  }

  protected doReschedule(task: Task) {
    const tomorrow = DateTimeUtils.tomorrow();
    if (task.deadlineDate) {
      task.deadlineDate = tomorrow;
    } else {
      const momentDeadline = moment(task.deadlineDateTime);
      const hours = momentDeadline.get('hour');
      const minutes = momentDeadline.get('minute');
      task.deadlineDateTime = DateTimeUtils.tomorrowAt(hours, minutes);
    }
  }
}

export class WeeklyTaskRecurrenceStrategy extends TaskRecurrenceStrategy {
  static readonly TYPE = 'weekly';

  dayOfWeek: WeekDay;

  getType(): string {
    return WeeklyTaskRecurrenceStrategy.TYPE;
  }

  deserialize(input: any): WeeklyTaskRecurrenceStrategy {
    this.dayOfWeek = WeekDay.forName(input.dayOfWeek);
    return this;
  }

  serialize(): any {
    return {type: this.getType(), dayOfWeek: this.dayOfWeek.name};
  }

  protected doReschedule(task: Task) {
    const nextWeek = DateTimeUtils.nextWeek(this.dayOfWeek);
    if (task.deadlineDate) {
      task.deadlineDate = nextWeek;
    } else {
      const momentDeadline = moment(task.deadlineDateTime);
      const hours = momentDeadline.get('hour');
      const minutes = momentDeadline.get('minute');
      task.deadlineDateTime = DateTimeUtils.nextWeekAt(hours, minutes, this.dayOfWeek);
    }
  }
}

export class MonthlyTaskRecurrenceStrategy extends TaskRecurrenceStrategy {
  static readonly TYPE = 'monthly';

  dayOfMonth: number;

  getType(): string {
    return MonthlyTaskRecurrenceStrategy.TYPE;
  }

  deserialize(input: any): MonthlyTaskRecurrenceStrategy {
    this.dayOfMonth = input.dayOfMonth;
    return this;
  }

  serialize(): any {
    return {type: this.getType(), dayOfMonth: this.dayOfMonth};
  }

  protected doReschedule(task: Task) {
    if (task.deadlineDate) {
      task.deadlineDate = DateTimeUtils.nextMonth(this.dayOfMonth);
    } else {
      const momentDeadline = moment(task.deadlineDateTime);
      const hours = momentDeadline.get('hour');
      const minutes = momentDeadline.get('minute');
      task.deadlineDateTime = DateTimeUtils.nextMonthAt(hours, minutes, this.dayOfMonth);
    }
  }
}

export class AnnuallyTaskRecurrenceStrategy extends TaskRecurrenceStrategy {
  static readonly TYPE = 'annually';

  month: Month;
  dayOfMonth: number;

  getType(): string {
    return AnnuallyTaskRecurrenceStrategy.TYPE;
  }

  deserialize(input: any): AnnuallyTaskRecurrenceStrategy {
    this.month = Month.forName(input.month);
    this.dayOfMonth = input.dayOfMonth;
    return this;
  }

  serialize(): any {
    return {type: this.getType(), month: this.month.name, dayOfMonth: this.dayOfMonth};
  }

  protected doReschedule(task: Task) {
    if (task.deadlineDate) {
      task.deadlineDate = DateTimeUtils.nextYear(this.month, this.dayOfMonth);
    } else {
      const momentDeadline = moment(task.deadlineDateTime);
      const hours = momentDeadline.get('hour');
      const minutes = momentDeadline.get('minute');
      task.deadlineDateTime = DateTimeUtils.nextYearAt(hours, minutes, this.month, this.dayOfMonth);
    }
  }
}
