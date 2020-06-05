import {Pipe, PipeTransform} from '@angular/core';

import * as moment from 'moment';

import {TranslateService} from '@ngx-translate/core';

@Pipe({
  name: 'localizedRelativeDate',
  pure: false
})
export class LocalizedRelativeDatePipe implements PipeTransform {
  constructor(private translate: TranslateService) {
  }

  transform(value: any, ...args: any[]): any {
    if (value == null) {
      return value;
    }

    const momentValue = moment(value);

    const startOfDay = moment().startOf('day');
    const endOfDay = moment().endOf('day');
    if (momentValue.isSameOrAfter(startOfDay) && momentValue.isSameOrBefore(endOfDay)) {
      return this.translate.instant('today');
    }

    if (momentValue.isBefore(moment())) {
      const yesterday = moment().subtract(1, 'day').startOf('day');
      if (momentValue.isSameOrAfter(yesterday)) {
        return this.translate.instant('yesterday');
      }
    } else {
      const tomorrow = moment().add(1, 'day').endOf('day');
      if (momentValue.isSameOrBefore(tomorrow)) {
        return this.translate.instant('tomorrow');
      }
    }

    return momentValue.fromNow();
  }
}
