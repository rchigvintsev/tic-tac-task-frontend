import {getTestBed, TestBed} from '@angular/core/testing';
import {HttpClient} from '@angular/common/http';
import {HttpClientTestingModule} from '@angular/common/http/testing';

import * as moment from 'moment';

import {TranslateLoader, TranslateModule} from '@ngx-translate/core';

import {LocalizedRelativeDatePipe} from './localized-relative-date.pipe';
import {TranslateHttpLoaderFactory} from '../app.module';

describe('LocalizedRelativeDate', () => {
  let injector: TestBed;
  let datePipe: LocalizedRelativeDatePipe;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: TranslateHttpLoaderFactory,
            deps: [HttpClient]
          }
        }),
      ],
      providers: [LocalizedRelativeDatePipe]
    });
    injector = getTestBed();
    datePipe = injector.inject(LocalizedRelativeDatePipe);

    moment.locale('en');
  });

  it('should be created', () => {
    const pipe: LocalizedRelativeDatePipe = TestBed.inject(LocalizedRelativeDatePipe);
    expect(pipe).toBeTruthy();
  });

  it('should ignore null value', () => {
    expect(datePipe.transform(null)).toBeNull();
  });

  it('should return localized relative date', () => {
    expect(datePipe.transform(moment().add(1, 'month').toDate())).toBe('in a month');
  });

  it('should return localized relative date for today', () => {
    expect(datePipe.transform(moment().toDate())).toBe('today');
  });

  it('should return localized relative date for yesterday', () => {
    expect(datePipe.transform(moment().subtract(1, 'day').toDate())).toBe('yesterday');
  });

  it('should return localized relative date for tomorrow', () => {
    expect(datePipe.transform(moment().add(1, 'day').toDate())).toBe('tomorrow');
  });
});
