import {Pipe, PipeTransform} from '@angular/core';
import {DatePipe} from '@angular/common';

import {LangChangeEvent, TranslateService} from '@ngx-translate/core';

@Pipe({
  name: 'localizedDate',
  pure: false
})
export class LocalizedDatePipe implements PipeTransform {
  private datePipe: DatePipe;

  constructor(private translate: TranslateService) {
    this.datePipe = new DatePipe(this.translate.currentLang);
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.datePipe = new DatePipe(event.lang);
    });
  }

  transform(value: any, pattern: string = 'mediumDate'): any {
    if (value == null) {
      return value;
    }
    return this.datePipe.transform(value, pattern);
  }
}
