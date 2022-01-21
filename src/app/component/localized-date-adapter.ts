import {NativeDateAdapter} from '@angular/material/core';
import {Injectable} from '@angular/core';
import {Platform} from '@angular/cdk/platform';

import {I18nService} from '../service/i18n.service';

@Injectable({providedIn: 'root'})
export class LocalizedDateAdapter extends NativeDateAdapter {
  constructor(private i18nService: I18nService, platform: Platform) {
    super(null, platform);
  }

  getFirstDayOfWeek(): number {
    if (this.i18nService.currentLanguage.code === 'ru') {
      return 1; // Start week from Monday
    }
    return super.getFirstDayOfWeek();
  }
}
