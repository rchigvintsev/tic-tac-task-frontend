import {LocalizedDateAdapter} from './localized-date-adapter';
import {getTestBed, TestBed} from '@angular/core/testing';
import {TestSupport} from '../test/test-support';
import {TranslateService} from '@ngx-translate/core';

describe('LocalizedDateAdapter', () => {
  let translate: TranslateService;
  let adapter: LocalizedDateAdapter;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: TestSupport.IMPORTS,
      declarations: TestSupport.DECLARATIONS
    });

    const injector = getTestBed();
    translate = injector.inject(TranslateService);
    adapter = injector.inject(LocalizedDateAdapter);
  });

  it('should start week from Monday when current language is Russian', () => {
    translate.currentLang = 'ru';
    expect(adapter.getFirstDayOfWeek()).toBe(1);
  });
});
