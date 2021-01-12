import {EventEmitter, Injectable} from '@angular/core';

import {LangChangeEvent, TranslateService} from '@ngx-translate/core';

import {LogService} from './log.service';

export class Language {
  constructor(readonly code: string, readonly name: string) {
  }
}

export const AVAILABLE_LANGUAGES = new Map<string, Language>();
AVAILABLE_LANGUAGES.set('en', new Language('en', 'English'));
AVAILABLE_LANGUAGES.set('ru', new Language('ru', 'Русский'));

@Injectable({
  providedIn: 'root'
})
export class I18nService {
  constructor(private translateService: TranslateService, private logService: LogService) {
  }

  get availableLanguages(): Language[] {
    return Array.from(AVAILABLE_LANGUAGES.values());
  }

  get currentLanguage(): Language {
    let langCode = this.translateService.currentLang;
    if (!langCode) {
      this.logService.debug('Current language is undefined. Fallback to english.');
      langCode = 'en';
    }
    let result = this.languageForCode(langCode);
    if (!result) {
      this.logService.warn('Unexpected language code: ' + langCode);
      result = new Language(langCode, langCode);
    }
    return result;
  }

  languageForCode(code: string): Language {
    return AVAILABLE_LANGUAGES.get(code);
  }

  get onLanguageChange(): EventEmitter<LangChangeEvent> {
    return this.translateService.onLangChange;
  }

  translate(key: string): string {
    return this.translateService.instant(key);
  }
}
