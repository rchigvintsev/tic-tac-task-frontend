export class WeekDay {
  private static readonly daysByName = new Map<string, WeekDay>();
  private static readonly daysByNumber = new Map<string, WeekDay>();

  static readonly MONDAY = new WeekDay('MONDAY', 1);
  static readonly TUESDAY = new WeekDay('TUESDAY', 2);
  static readonly WEDNESDAY = new WeekDay('WEDNESDAY', 3);
  static readonly THURSDAY = new WeekDay('THURSDAY', 4);
  static readonly FRIDAY = new WeekDay('FRIDAY', 5);
  static readonly SATURDAY = new WeekDay('SATURDAY', 6);
  static readonly SUNDAY = new WeekDay('SUNDAY', 7);

  private constructor(public readonly name: string, public readonly dayNumber: number) {
    WeekDay.daysByName[name] = this;
    WeekDay.daysByNumber[dayNumber] = this;
  }

  static forName(name: string): WeekDay {
    return this.daysByName[name];
  }

  static forNumber(n: number): WeekDay {
    return this.daysByNumber[n];
  }
}
