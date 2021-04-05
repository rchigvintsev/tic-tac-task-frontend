import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {DomSanitizer} from '@angular/platform-browser';
import {MatIconRegistry} from '@angular/material/icon';
import {I18nService} from '../../../service/i18n.service';
import {AlertService} from '../../../service/alert.service';
import {ConfigService} from '../../../service/config.service';

@Component({
  selector: 'app-base-sign',
  templateUrl: './base-sign.component.html',
  styleUrls: ['./base-sign.component.styl']
})
export class BaseSignComponent implements OnInit {
  email: string;
  password: string;

  private readonly redirectUri: string;

  constructor(
    iconRegistry: MatIconRegistry,
    domSanitizer: DomSanitizer,
    protected alertService: AlertService,
    protected i18nService: I18nService,
    private config: ConfigService,
    private activatedRoute: ActivatedRoute
  ) {
    const currentLang = i18nService.currentLanguage;
    this.redirectUri = `${this.config.selfBaseUrl}/${currentLang.code}/oauth2/authorization/callback`;

    iconRegistry.addSvgIcon('logo-google',
      domSanitizer.bypassSecurityTrustResourceUrl('../assets/img/btn_google_light_normal.svg'));
    iconRegistry.addSvgIcon('logo-facebook', domSanitizer.bypassSecurityTrustResourceUrl('../assets/img/FB_Logo.svg'));
    iconRegistry.addSvgIcon('logo-github', domSanitizer.bypassSecurityTrustResourceUrl('../assets/img/GitHub_Logo.svg'));
    iconRegistry.addSvgIcon('logo-vk', domSanitizer.bypassSecurityTrustResourceUrl('../assets/img/VK_Blue_Logo.svg'));
  }

  ngOnInit(): void {
    this.activatedRoute.queryParamMap.subscribe(params => {
      const messageCode = params.get('message');
      if (messageCode) {
        const error = params.get('error');
        if (error === 'true') {
          this.alertService.error(this.getErrorMessage(messageCode));
        } else {
          this.alertService.info(this.i18nService.translate(messageCode));
        }
      }
    });
  }

  buildAuthorizationUri(provider: string): string {
    return `${this.config.apiBaseUrl}/oauth2/authorization/${provider}?client-redirect-uri=${this.redirectUri}`;
  }

  protected getDefaultErrorMessage(): string {
    throw new Error('Method "getDefaultErrorMessage" is not implemented');
  }

  private getErrorMessage(messageCode: string): string {
    if (messageCode === 'default') {
      return this.getDefaultErrorMessage();
    }
    return this.i18nService.translate(messageCode);
  }
}
