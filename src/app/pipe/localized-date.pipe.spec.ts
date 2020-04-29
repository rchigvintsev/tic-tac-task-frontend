import {getTestBed, TestBed} from '@angular/core/testing';
import {HttpClient} from '@angular/common/http';
import {HttpClientTestingModule} from '@angular/common/http/testing';

import {LangChangeEvent, TranslateLoader, TranslateModule, TranslateService} from '@ngx-translate/core';

import * as moment from 'moment';

import {LocalizedDatePipe} from './localized-date.pipe';
import {TranslateHttpLoaderFactory} from '../app.module';

describe('LocalizedDate', () => {
  let injector: TestBed;
  let translate: TranslateService;
  let datePipe: LocalizedDatePipe;

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
        })
      ],
      providers: [LocalizedDatePipe]
    });

    injector = getTestBed();

    translate = injector.get(TranslateService);
    translate.currentLang = 'en';

    datePipe = injector.get(LocalizedDatePipe);
  });

  it('should be created', () => {
    const pipe: LocalizedDatePipe = TestBed.get(LocalizedDatePipe);
    expect(pipe).toBeTruthy();
  });

  it('should ignore null value', () => {
    expect(datePipe.transform(null)).toBeNull();
  });

  it('should format date using default "mediumDate" format', () => {
    expect(datePipe.transform(moment('2020-04-28 13:58').toDate())).toBe('Apr 28, 2020');
  });

  it('should format date using "medium" format', () => {
    expect(datePipe.transform(moment('2020-04-28 13:58').toDate(), 'medium')).toBe('Apr 28, 2020, 1:58:00 PM');
  });

  it('should format date using locale corresponding to current language', () => {
    translate.onLangChange.emit(new TestLangChangeEvent('ru'));
    expect(datePipe.transform(moment('2020-04-28 13:58').toDate(), 'medium')).toBe('28 апр. 2020 г., 13:58:00');
  });
});

class TestLangChangeEvent implements LangChangeEvent {
  translations: any;

  constructor(public lang: string) {
  }
}
