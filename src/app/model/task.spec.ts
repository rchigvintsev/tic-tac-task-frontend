import * as moment from 'moment';

import {Task} from './task';

describe('Task', () => {
  it('should not be considered overdue when deadline is not defined', () => {
    const task = new Task();
    expect(task.isOverdue()).toBeFalsy();
  });

  it('should not be considered overdue when deadline is not past', () => {
    const task = new Task().deserialize({deadlineDate: moment().add(1, 'days')});
    expect(task.isOverdue()).toBeFalsy();
  });

  it('should be considered overdue when deadline is past one day ago', () => {
    const task = new Task().deserialize({deadlineDate: moment().subtract(1, 'days')});
    expect(task.isOverdue()).toBeTruthy();
  });

  it('should be considered overdue when deadline is past one minute ago', () => {
    const task = new Task().deserialize({deadlineDateTime: moment().subtract(1, 'minute')});
    expect(task.isOverdue()).toBeTruthy();
  });
});
