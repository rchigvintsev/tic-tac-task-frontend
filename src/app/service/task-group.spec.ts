import {TaskGroup} from '../model/task-group';

describe('TaskGroup', () => {
  it(`'valueOf' should return INBOX`, () => {
    expect(TaskGroup.valueOf('inbox')).toBe(TaskGroup.INBOX);
  });

  it(`'valueOf' should return TODAY`, () => {
    expect(TaskGroup.valueOf('today')).toBe(TaskGroup.TODAY);
  });

  it(`'valueOf' should return TOMORROW`, () => {
    expect(TaskGroup.valueOf('tomorrow')).toBe(TaskGroup.TOMORROW);
  });

  it(`'valueOf' should return WEEK`, () => {
    expect(TaskGroup.valueOf('week')).toBe(TaskGroup.WEEK);
  });

  it(`'valueOf' should return SOME_DAY`, () => {
    expect(TaskGroup.valueOf('some-day')).toBe(TaskGroup.SOME_DAY);
  });

  it(`'valueOf' should return null for null`, () => {
    expect(TaskGroup.valueOf(null)).toBeNull();
  });

  it(`'valueOf' should return null for invalid value`, () => {
    expect(TaskGroup.valueOf('century')).toBeNull();
  });
});
