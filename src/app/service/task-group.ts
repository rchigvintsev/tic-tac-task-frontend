export class TaskGroup {
  public static INBOX = new TaskGroup('inbox');
  public static TODAY = new TaskGroup('today');
  public static TOMORROW = new TaskGroup('tomorrow');
  public static WEEK = new TaskGroup('week');
  public static SOME_DAY = new TaskGroup('some-day');
  public static ALL = new TaskGroup('all');

  private constructor(public value: string) {
  }

  public static valueOf(s: string): TaskGroup {
    switch (s) {
      case TaskGroup.INBOX.value:
        return TaskGroup.INBOX;
      case TaskGroup.TODAY.value:
        return TaskGroup.TODAY;
      case TaskGroup.TOMORROW.value:
        return TaskGroup.TOMORROW;
      case TaskGroup.WEEK.value:
        return TaskGroup.WEEK;
      case TaskGroup.SOME_DAY.value:
        return TaskGroup.SOME_DAY;
      case TaskGroup.ALL.value:
        return TaskGroup.ALL;
    }
    return null;
  }

  public static values(): Array<TaskGroup> {
    return [this.INBOX, this.TODAY, this.TOMORROW, this.WEEK, this.SOME_DAY, this.ALL];
  }
}
