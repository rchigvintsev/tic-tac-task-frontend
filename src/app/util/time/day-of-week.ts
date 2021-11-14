export class DayOfWeek {
  private static readonly daysByName = new Map<string, DayOfWeek>();
  private static readonly daysByCode = new Map<string, DayOfWeek>();

  static readonly MONDAY = new DayOfWeek('MONDAY', 1);
  static readonly TUESDAY = new DayOfWeek('TUESDAY', 2);
  static readonly WEDNESDAY = new DayOfWeek('WEDNESDAY', 3);
  static readonly THURSDAY = new DayOfWeek('THURSDAY', 4);
  static readonly FRIDAY = new DayOfWeek('FRIDAY', 5);
  static readonly SATURDAY = new DayOfWeek('SATURDAY', 6);
  static readonly SUNDAY = new DayOfWeek('SUNDAY', 7);

  private constructor(public readonly name: string, public readonly code: number) {
    DayOfWeek.daysByName[name] = this;
    DayOfWeek.daysByCode[code] = this;
  }

  static forName(name: string): DayOfWeek {
    return this.daysByName[name];
  }

  static forCode(code: number): DayOfWeek {
    return this.daysByCode[code];
  }
}
