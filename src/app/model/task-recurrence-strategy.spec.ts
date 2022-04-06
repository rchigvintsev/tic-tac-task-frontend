import * as moment from 'moment';

import {Task} from './task';
import {
  AnnuallyTaskRecurrenceStrategy,
  DailyTaskRecurrenceStrategy,
  MonthlyTaskRecurrenceStrategy,
  WeeklyTaskRecurrenceStrategy
} from './task-recurrence-strategy';
import {DateTimeUtils} from '../util/time/date-time-utils';
import {WeekDay} from '../util/time/week-day';
import {Month} from '../util/time/month';

describe('TaskRescheduleStrategy', () => {
  describe('Daily', () => {
    let recurrenceStrategy: DailyTaskRecurrenceStrategy;

    beforeEach(() => {
      recurrenceStrategy = new DailyTaskRecurrenceStrategy();
    });

    it('should reschedule task deadline date for tomorrow', () => {
      const task = new Task().deserialize({id: 1, deadlineDate: DateTimeUtils.formatDate(new Date())});
      recurrenceStrategy.reschedule(task);

      const expectedDate = DateTimeUtils.formatDate(moment().add(1, 'day').toDate())
      expect(DateTimeUtils.formatDate(task.deadlineDate)).toBe(expectedDate);
    });

    it('should reschedule task deadline date/time for tomorrow', () => {
      const task = new Task().deserialize({id: 1, deadlineDateTime: DateTimeUtils.formatDateTime(new Date())});
      recurrenceStrategy.reschedule(task);

      const expectedDateTime = DateTimeUtils.formatDateTime(moment().add(1, 'day').toDate())
      expect(DateTimeUtils.formatDateTime(task.deadlineDateTime)).toBe(expectedDateTime);
    });
  });

  describe('Weekly', () => {
    let recurrenceStrategy: WeeklyTaskRecurrenceStrategy;

    beforeEach(() => {
      recurrenceStrategy = new WeeklyTaskRecurrenceStrategy();
      recurrenceStrategy.dayOfWeek = WeekDay.MONDAY;
    });

    it('should reschedule task deadline date for next Monday', () => {
      const task = new Task().deserialize({id: 1, deadlineDate: DateTimeUtils.formatDate(new Date())});
      recurrenceStrategy.reschedule(task);

      expect(task.deadlineDate.getTime()).toBeGreaterThan(Date.now())
      expect(moment(task.deadlineDate).isoWeekday()).toBe(WeekDay.MONDAY.dayNumber);
    });

    it('should preserve task deadline time on reschedule', () => {
      const task = new Task().deserialize({id: 1, deadlineDateTime: DateTimeUtils.formatDateTime(new Date())});
      recurrenceStrategy.reschedule(task);

      const expectedTime = DateTimeUtils.formatTime(new Date());
      expect(DateTimeUtils.formatTime(task.deadlineDateTime)).toBe(expectedTime);
    });
  });

  describe('Monthly', () => {
    let recurrenceStrategy: MonthlyTaskRecurrenceStrategy;

    beforeEach(() => {
      recurrenceStrategy = new MonthlyTaskRecurrenceStrategy();
      recurrenceStrategy.dayOfMonth = 1;
    });

    it('should reschedule task deadline date for first day of next month', () => {
      const task = new Task().deserialize({id: 1, deadlineDate: DateTimeUtils.formatDate(new Date())});
      recurrenceStrategy.reschedule(task);

      expect(moment(task.deadlineDate).month()).toBe(moment().month() + 1);
      expect(moment(task.deadlineDate).date()).toBe(1);
    });

    it('should reschedule task deadline date for last day of next month', () => {
      recurrenceStrategy.dayOfMonth = 31;

      const task = new Task().deserialize({id: 1, deadlineDate: DateTimeUtils.formatDate(new Date())});
      recurrenceStrategy.reschedule(task);

      const nextMonth = moment().add(1, 'month');
      expect(moment(task.deadlineDate).month()).toBe(nextMonth.month());
      expect(moment(task.deadlineDate).date()).toBe(nextMonth.daysInMonth());
    });

    it('should preserve task deadline time on reschedule', () => {
      const task = new Task().deserialize({id: 1, deadlineDateTime: DateTimeUtils.formatDateTime(new Date())});
      recurrenceStrategy.reschedule(task);

      const expectedTime = DateTimeUtils.formatTime(new Date());
      expect(DateTimeUtils.formatTime(task.deadlineDateTime)).toBe(expectedTime);
    });
  });

  describe('Annually', () => {
    let recurrenceStrategy: AnnuallyTaskRecurrenceStrategy;

    beforeEach(() => {
      recurrenceStrategy = new AnnuallyTaskRecurrenceStrategy();
      recurrenceStrategy.month = Month.JANUARY;
      recurrenceStrategy.dayOfMonth = 1;
    });

    it('should reschedule task deadline date for January 1st of next year', () => {
      const task = new Task().deserialize({id: 1, deadlineDate: DateTimeUtils.formatDate(new Date())});
      recurrenceStrategy.reschedule(task);

      expect(moment(task.deadlineDate).month()).toBe(Month.JANUARY.monthNumber - 1);
      expect(moment(task.deadlineDate).date()).toBe(1);
    });

    it('should reschedule task deadline date for January 31st of next year', () => {
      recurrenceStrategy.dayOfMonth = 31;

      const task = new Task().deserialize({id: 1, deadlineDate: DateTimeUtils.formatDate(new Date())});
      recurrenceStrategy.reschedule(task);

      expect(moment(task.deadlineDate).month()).toBe(Month.JANUARY.monthNumber - 1);
      expect(moment(task.deadlineDate).date()).toBe(31);
    });

    it('should preserve task deadline time on reschedule', () => {
      const task = new Task().deserialize({id: 1, deadlineDateTime: DateTimeUtils.formatDateTime(new Date())});
      recurrenceStrategy.reschedule(task);

      const expectedTime = DateTimeUtils.formatTime(new Date());
      expect(DateTimeUtils.formatTime(task.deadlineDateTime)).toBe(expectedTime);
    });
  });
});
