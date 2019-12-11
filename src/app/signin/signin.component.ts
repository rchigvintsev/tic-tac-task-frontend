import {Component} from '@angular/core';
import {Router} from '@angular/router';
import {DomSanitizer} from '@angular/platform-browser';
import {MatIconRegistry} from '@angular/material/icon';

import {TranslateService} from '@ngx-translate/core';

import {AbstractComponent} from '../abstract-component';
import {ConfigService} from '../service/config.service';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.styl']
})
export class SigninComponent extends AbstractComponent {
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
    iconRegistry.addSvgIcon('logo-facebook', domSanitizer.bypassSecurityTrustResourceUrl('../assets/img/FB_Logo.svg'));
    iconRegistry.addSvgIcon('logo-github', domSanitizer.bypassSecurityTrustResourceUrl('../assets/img/GitHub_Logo.svg'));
    iconRegistry.addSvgIcon('logo-vk', domSanitizer.bypassSecurityTrustResourceUrl('../assets/img/VK_Blue_Logo.svg'));
  }

  buildAuthorizationUri(provider: string): string {
    const redirectUri = `${this.config.selfBaseUrl}/${this.translate.currentLang}/oauth2/authorization/success`;
    return `${this.config.apiBaseUrl}/oauth2/authorization/${provider}?client-redirect-uri=${redirectUri}`;
  }
}
