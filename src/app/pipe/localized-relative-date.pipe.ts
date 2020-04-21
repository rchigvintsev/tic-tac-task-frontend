import {Pipe, PipeTransform} from '@angular/core';

import * as moment from 'moment';

@Pipe({
  name: 'localizedRelativeDate',
  pure: false
})
export class LocalizedRelativeDatePipe implements PipeTransform {
  transform(value: any, ...args: any[]): any {
    if (value == null) {
      return value;
    }
    return moment(value, moment.HTML5_FMT.DATETIME_LOCAL_MS).fromNow();
  }
}
