export class Month {
  private static readonly monthsByName = new Map<string, Month>();
  private static readonly monthsByCode = new Map<number, Month>();

  static readonly JANUARY = new Month('JANUARY', 1);
  static readonly FEBRUARY = new Month('FEBRUARY', 2);
  static readonly MARCH = new Month('MARCH', 3);
  static readonly APRIL = new Month('APRIL', 4);
  static readonly MAY = new Month('MAY', 5);
  static readonly JUNE = new Month('JUNE', 6);
  static readonly JULY = new Month('JULY', 7);
  static readonly AUGUST = new Month('AUGUST', 8);
  static readonly SEPTEMBER = new Month('SEPTEMBER', 9);
  static readonly OCTOBER = new Month('OCTOBER', 10);
  static readonly NOVEMBER = new Month('NOVEMBER', 11);
  static readonly DECEMBER = new Month('DECEMBER', 12);

  private constructor(public readonly name: string, public readonly code: number) {
    Month.monthsByName[name] = this;
    Month.monthsByCode[code] = this;
  }

  static forName(name: string): Month {
    return Month.monthsByName[name];
  }

  static forCode(code: number): Month {
    return Month.monthsByCode[code];
  }
}
