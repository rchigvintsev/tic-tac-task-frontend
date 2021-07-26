import {Pipe, PipeTransform} from '@angular/core';

@Pipe({name: 'messageFormat', pure: true})
export class MessageFormatPipe implements PipeTransform {
  transform(value: any, ...args: any[]): any {
    if (value == null) {
      return value;
    }
    const s = value.toString();
    if (s.length === 0 || args.length === 0) {
      return s;
    }
    return s.replace(/{(\d*)}/g, (match, n) => {
      if (n >= args.length) {
        return match;
      }
      return args[n];
    })
  }
}
