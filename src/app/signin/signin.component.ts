import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {DomSanitizer} from '@angular/platform-browser';
import {MatIconRegistry} from '@angular/material/icon';

import {TranslateService} from '@ngx-translate/core';

import {WebServiceBasedComponent} from '../web-service-based.component';
import {ConfigService} from '../service/config.service';
import {AlertService} from '../service/alert.service';
import {LogService} from '../service/log.service';
import {AuthenticationService} from '../service/authentication.service';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.styl']
})
export class SigninComponent extends WebServiceBasedComponent implements OnInit {
  config: ConfigService;

  private readonly redirectUri: string;

  constructor(
    router: Router,
    translate: TranslateService,
    authenticationService: AuthenticationService,
    log: LogService,
    config: ConfigService,
    iconRegistry: MatIconRegistry,
    domSanitizer: DomSanitizer,
    private activatedRoute: ActivatedRoute,
    private alertService: AlertService
  ) {
    super(router, translate, authenticationService, log);

    this.config = config;
    this.redirectUri = `${config.selfBaseUrl}/${translate.currentLang}/oauth2/authorization/callback`;

    iconRegistry.addSvgIcon('logo-google',
      domSanitizer.bypassSecurityTrustResourceUrl('../assets/img/btn_google_light_normal.svg'));
    iconRegistry.addSvgIcon('logo-facebook', domSanitizer.bypassSecurityTrustResourceUrl('../assets/img/FB_Logo.svg'));
    iconRegistry.addSvgIcon('logo-github', domSanitizer.bypassSecurityTrustResourceUrl('../assets/img/GitHub_Logo.svg'));
    iconRegistry.addSvgIcon('logo-vk', domSanitizer.bypassSecurityTrustResourceUrl('../assets/img/VK_Blue_Logo.svg'));
  }

  ngOnInit(): void {
    this.activatedRoute.queryParamMap.subscribe(params => {
      if (params.get('error')) {
        this.alertService.error(this.translate.instant('sign_in_error'));
      }
    });
  }

  buildAuthorizationUri(provider: string): string {
    return `${this.config.apiBaseUrl}/oauth2/authorization/${provider}?client-redirect-uri=${this.redirectUri}`;
  }
}
