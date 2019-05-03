import {Strings} from './strings';

describe('Strings', () => {
  it(`'isBlank' should return 'true' for 'null'`, () => {
    expect(Strings.isBlank(null)).toBeTruthy();
  });

  it(`'isBlank' should return 'true' for 'undefined'`, () => {
    expect(Strings.isBlank(undefined)).toBeTruthy();
  });

  it(`'isBlank' should return 'true' for empty string`, () => {
    expect(Strings.isBlank('')).toBeTruthy();
  });

  it(`'isBlank' should return 'true' for ' '`, () => {
    expect(Strings.isBlank(' ')).toBeTruthy();
  });

  it(`'isBlank' should return 'false' for 'abc'`, () => {
    expect(Strings.isBlank('abc')).toBeFalsy();
  });

  it(`'isBlank' should return 'false' for ' abc'`, () => {
    expect(Strings.isBlank(' abc')).toBeFalsy();
  });

  it(`'isBlank' should return 'false' for 'abc '`, () => {
    expect(Strings.isBlank('abc ')).toBeFalsy();
  });

  it(`'isBlank' should return 'false' for ' abc '`, () => {
    expect(Strings.isBlank(' abc ')).toBeFalsy();
  });
});
