import {getTestBed, TestBed} from '@angular/core/testing';

import * as moment from 'moment';

import {LocalizedRelativeDatePipe} from './localized-relative-date.pipe';

describe('LocalizedRelativeDate', () => {
  let injector: TestBed;
  let datePipe: LocalizedRelativeDatePipe;

  beforeEach(() => {
    TestBed.configureTestingModule({providers: [LocalizedRelativeDatePipe]});
    injector = getTestBed();
    datePipe = injector.get(LocalizedRelativeDatePipe);

    moment.locale('en');
  });

  it('should be created', () => {
    const pipe: LocalizedRelativeDatePipe = TestBed.get(LocalizedRelativeDatePipe);
    expect(pipe).toBeTruthy();
  });

  it('should ignore null value', () => {
    expect(datePipe.transform(null)).toBeNull();
  });

  it('should return localized relative date', () => {
    expect(datePipe.transform(moment().add(1, 'month').toDate())).toBe('in a month');
  });
});
