import {Strings} from './strings';

describe('Strings', () => {
  it(`'isBlank' should return 'true' for 'null'`, () => {
    expect(Strings.isBlank(null)).toBeTruthy();
  });
});
