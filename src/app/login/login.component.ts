import {Component} from '@angular/core';
import {Router} from '@angular/router';
import {DomSanitizer} from '@angular/platform-browser';
import {MatIconRegistry} from '@angular/material/icon';

import {TranslateService} from '@ngx-translate/core';

import {AbstractComponent} from '../abstract-component';
import {ConfigService} from '../service/config.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.styl']
})
export class LoginComponent extends AbstractComponent {
  config: ConfigService;

  constructor(
    router: Router,
    translate: TranslateService,
    config: ConfigService,
    iconRegistry: MatIconRegistry,
    domSanitizer: DomSanitizer
  ) {
    super(router, translate);
    this.config = config;
    iconRegistry.addSvgIcon('logo-google',
      domSanitizer.bypassSecurityTrustResourceUrl('../assets/img/btn_google_light_normal.svg'));
  }

  buildAuthorizationUri(provider: string): string {
    const redirectUri = `${this.config.selfBaseUrl}/${this.translate.currentLang}/login/callback`;
    return `${this.config.apiBaseUrl}/oauth2/authorization/${provider}?client-redirect-uri=${redirectUri}`;
  }
}
