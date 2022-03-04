import {Serializable} from './serializable';
import {Month} from '../util/time/month';
import {WeekDay} from '../util/time/week-day';

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
}

export class DailyTaskRecurrenceStrategy implements TaskRecurrenceStrategy {
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
}

export class WeeklyTaskRecurrenceStrategy implements TaskRecurrenceStrategy {
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
}

export class MonthlyTaskRecurrenceStrategy implements TaskRecurrenceStrategy {
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
}

export class AnnuallyTaskRecurrenceStrategy implements TaskRecurrenceStrategy {
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
}
