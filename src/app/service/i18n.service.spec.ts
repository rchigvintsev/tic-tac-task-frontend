import {getTestBed, TestBed} from '@angular/core/testing';

import {TranslateService} from '@ngx-translate/core';

import {I18nService, Language} from './i18n.service';
import {TestSupport} from '../test/test-support';

describe('I18nService', () => {
  let translate: TranslateService;
  let service: I18nService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: TestSupport.IMPORTS,
      declarations: TestSupport.DECLARATIONS
    });

    const injector = getTestBed();
    translate = injector.inject(TranslateService);
    service = injector.inject(I18nService);
  });

  it('should return current language', () => {
    translate.currentLang = 'ru';
    const currentLanguage = service.currentLanguage;
    expect(currentLanguage).toEqual(new Language('ru', 'Русский'));
  });

  it('should fallback to english when current language is undefined', () => {
    translate.currentLang = null;
    const currentLanguage = service.currentLanguage;
    expect(currentLanguage).toEqual(new Language('en', 'English'));
  });

  it('should return language for unknown language code', () => {
    translate.currentLang = 'cs';
    const currentLanguage = service.currentLanguage;
    expect(currentLanguage).toEqual(new Language('cs', 'cs'));
  });
});
