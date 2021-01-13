import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {DomSanitizer} from '@angular/platform-browser';
import {MatIconRegistry} from '@angular/material/icon';
import {NgForm} from '@angular/forms';

import {WebServiceBasedComponent} from '../web-service-based.component';
import {I18nService} from '../../service/i18n.service';
import {AuthenticationService} from '../../service/authentication.service';
import {LogService} from '../../service/log.service';
import {ConfigService} from '../../service/config.service';
import {AlertService} from '../../service/alert.service';
import {HttpErrors} from '../../util/http-errors';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.styl']
})
export class SigninComponent extends WebServiceBasedComponent implements OnInit {
  email: string;
  password: string;

  @ViewChild('signinForm', {read: NgForm})
  signinForm: NgForm;

  private readonly config: ConfigService;
  private readonly redirectUri: string;

  constructor(
    i18nService: I18nService,
    authenticationService: AuthenticationService,
    log: LogService,
    config: ConfigService,
    router: Router,
    iconRegistry: MatIconRegistry,
    domSanitizer: DomSanitizer,
    private activatedRoute: ActivatedRoute,
    private alertService: AlertService,
  ) {
    super(i18nService, authenticationService, log, router);

    this.config = config;
    const currentLang = i18nService.currentLanguage;
    this.redirectUri = `${config.selfBaseUrl}/${currentLang.code}/oauth2/authorization/callback`;

    iconRegistry.addSvgIcon('logo-google',
      domSanitizer.bypassSecurityTrustResourceUrl('../assets/img/btn_google_light_normal.svg'));
    iconRegistry.addSvgIcon('logo-facebook', domSanitizer.bypassSecurityTrustResourceUrl('../assets/img/FB_Logo.svg'));
    iconRegistry.addSvgIcon('logo-github', domSanitizer.bypassSecurityTrustResourceUrl('../assets/img/GitHub_Logo.svg'));
    iconRegistry.addSvgIcon('logo-vk', domSanitizer.bypassSecurityTrustResourceUrl('../assets/img/VK_Blue_Logo.svg'));
  }

  ngOnInit(): void {
    this.activatedRoute.queryParamMap.subscribe(params => {
      if (params.get('error')) {
        this.alertService.error(this.i18nService.translate('sign_in_error'));
      }
    });
  }

  onSigninFormSubmit() {
    if (this.signinForm.valid) {
      this.authenticationService.signIn(this.email, this.password).subscribe(
        accessTokenClaims => this.onSignIn(accessTokenClaims),
        error => this.onSignInError(error)
      );
    }
  }

  buildAuthorizationUri(provider: string): string {
    return `${this.config.apiBaseUrl}/oauth2/authorization/${provider}?client-redirect-uri=${this.redirectUri}`;
  }

  private onSignIn(accessTokenClaims: any) {
    const principal = this.authenticationService.createPrincipal(accessTokenClaims);
    this.authenticationService.setPrincipal(principal);
    this.navigateToHomePage();
  }

  private onSignInError(error: any) {
    if (HttpErrors.isUnauthorized(error)) {
      this.alertService.error(this.i18nService.translate('user_not_found_or_invalid_password'));
    } else {
      this.onServiceCallError(error);
    }
  }

  private navigateToHomePage() {
    const currentLang = this.i18nService.currentLanguage;
    this.router.navigate([currentLang.code]).then();
  }
}
