import {Component, Input, OnInit} from '@angular/core';
import {MatSnackBar, MatSnackBarConfig, MatSnackBarRef} from '@angular/material/snack-bar';

import {CookieConsentContentComponent} from './content/cookie-consent-content.component';
import {CookieService} from 'ngx-cookie-service';
import * as moment from 'moment';
import {ConfigService} from '../../../service/config.service';

@Component({
  selector: 'app-cookie-consent',
  template: ''
})
export class CookieConsentComponent implements OnInit {
  private static readonly COOKIE_CONSENT_STATUS_COOKIE_NAME = 'cookie_consent_status';
  private static readonly COOKIE_CONSENT_STATUS_VALUE_DISMISS = 'dismiss';

  private static readonly SNACK_BAR_POSITION_TOP_LEFT = 'top-left';
  private static readonly SNACK_BAR_POSITION_TOP_RIGHT = 'top-right';
  private static readonly SNACK_BAR_POSITION_BOTTOM_LEFT = 'bottom-left';
  private static readonly SNACK_BAR_POSITION_BOTTOM_RIGHT = 'bottom-right';

  private snackBarRef: MatSnackBarRef<CookieConsentContentComponent>;
  private _position: string;

  constructor(private snackBar: MatSnackBar, private cookieService: CookieService, private configService: ConfigService) {
  }

  private static isNeedToShowBanner(cookieConsentStatus: string) {
    return cookieConsentStatus !== CookieConsentComponent.COOKIE_CONSENT_STATUS_VALUE_DISMISS;
  }

  ngOnInit(): void {
    const cookieConsentStatus = this.getCookieConsentStatus();
    if (CookieConsentComponent.isNeedToShowBanner(cookieConsentStatus)) {
      const snackBarConfig = {};
      this.setSnackBarPosition(snackBarConfig);
      this.snackBarRef = this.snackBar.openFromComponent(CookieConsentContentComponent, snackBarConfig);
      this.snackBarRef.onAction().subscribe(() => {
        this.setCookieConsentStatus(CookieConsentComponent.COOKIE_CONSENT_STATUS_VALUE_DISMISS);
      });
    }
  }

  @Input() set position(value: string) {
    this._position = value;
  }

  private getCookieConsentStatus(): string {
    return this.cookieService.get(CookieConsentComponent.COOKIE_CONSENT_STATUS_COOKIE_NAME);
  }

  private setCookieConsentStatus(value: string) {
    const expiresAt = moment().add(1, 'year').toDate();
    const domain = this.configService.domain ? `.${this.configService.domain}` : null;
    this.cookieService.set(CookieConsentComponent.COOKIE_CONSENT_STATUS_COOKIE_NAME, value, expiresAt, '/', domain);
  }

  private setSnackBarPosition(snackBarConfig: MatSnackBarConfig) {
    switch (this._position) {
      case CookieConsentComponent.SNACK_BAR_POSITION_TOP_LEFT:
        snackBarConfig.verticalPosition = 'top';
        snackBarConfig.horizontalPosition = 'left';
        break;
      case CookieConsentComponent.SNACK_BAR_POSITION_TOP_RIGHT:
        snackBarConfig.verticalPosition = 'top';
        snackBarConfig.horizontalPosition = 'right';
        break;
      case CookieConsentComponent.SNACK_BAR_POSITION_BOTTOM_LEFT:
        snackBarConfig.verticalPosition = 'bottom';
        snackBarConfig.horizontalPosition = 'left';
        break;
      default:
        snackBarConfig.verticalPosition = 'bottom';
        snackBarConfig.horizontalPosition = 'right';
    }
  }
}
