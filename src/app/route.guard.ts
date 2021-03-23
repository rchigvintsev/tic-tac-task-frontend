import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlSegment, UrlTree} from '@angular/router';

import {Observable, of} from 'rxjs';
import {catchError, map} from 'rxjs/operators';

import {I18nService} from './service/i18n.service';
import {AuthenticationService} from './service/authentication.service';
import {UserService} from './service/user.service';
import {LogService} from './service/log.service';

@Injectable({providedIn: 'root'})
export class LocalizedRouteGuard implements CanActivate {
  constructor(private i18nService: I18nService, private router: Router) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): UrlTree {
    const lang = this.getLanguageFromUrl(route.url);
    if (lang != null) {
      return this.navigateTo404Page(lang);
    }
    return this.navigateToTargetPage(this.i18nService.currentLanguage.code, route);
  }

  private getLanguageFromUrl(url: UrlSegment[]): string {
    if (url.length > 0) {
      const firstSegment = url[0];
      if (this.i18nService.languageForCode(firstSegment.path)) {
        return firstSegment.path;
      }
    }
    return null;
  }

  private navigateToTargetPage(language: string, route: ActivatedRouteSnapshot): UrlTree {
    const commands = [language];
    for (const segment of route.url) {
      commands.push(segment.path);
    }
    return this.router.createUrlTree(commands, {queryParams: route.queryParams});
  }

  private navigateTo404Page(language: string): UrlTree {
    return this.router.createUrlTree([language, 'error', '404']);
  }
}

@Injectable({providedIn: 'root'})
export class OAuth2AuthorizationCallbackRouteGuard implements CanActivate {
  constructor(private authenticationService: AuthenticationService,
              private i18nService: I18nService,
              private router: Router) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    const currentLang = this.i18nService.currentLanguage;
    if (route.queryParamMap.get('error')) {
      return this.router.navigate([currentLang.code, 'signin'], {queryParams: {error: true, message: 'default'}});
    }

    const encodedClaims = route.queryParamMap.get('access_token_claims');
    if (encodedClaims) {
      const claims = this.authenticationService.parseAccessTokenClaims(encodedClaims);
      const principal = this.authenticationService.createPrincipal(claims);
      this.authenticationService.setPrincipal(principal);
    }
    return this.router.navigate([currentLang.code]);
  }
}

@Injectable({providedIn: 'root'})
export class EmailConfirmationCallbackRouteGuard implements CanActivate {
  constructor(private userService: UserService,
              private i18nService: I18nService,
              private log: LogService,
              private router: Router) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<UrlTree> {
    const userId = parseInt(route.queryParamMap.get('userId'), 10);
    const token = route.queryParamMap.get('token');
    if (!userId || !token) {
      return of(this.router.createUrlTree([this.i18nService.currentLanguage.code, 'signin'],
        {queryParams: {error: true, message: 'invalid_email_confirmation_params'}}));
    } else {
      return this.userService.confirmEmail(userId, token).pipe(
        map(_ => {
          return this.router.createUrlTree([this.i18nService.currentLanguage.code, 'signin'],
            {queryParams: {error: false, message: 'email_confirmed'}});
        }),
        catchError(error => {
          this.log.error(`Failed to confirm email for user with id ${userId}: ${error}`);
          return of(this.router.createUrlTree([this.i18nService.currentLanguage.code, 'signin'],
            {queryParams: {error: true, message: 'email_confirmation_error'}}));
        })
      );
    }
  }
}

@Injectable({providedIn: 'root'})
export class PasswordResetConfirmationCallbackRouteGuard implements CanActivate {
  constructor(private i18nService: I18nService, private router: Router) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const userId = parseInt(route.queryParamMap.get('userId'), 10);
    const token = route.queryParamMap.get('token');
    if (!userId || !token) {
      this.router.navigate([this.i18nService.currentLanguage.code, 'signin'],
        {queryParams: {error: true, message: 'invalid_password_reset_confirmation_params'}});
      return false;
    }
    return true;
  }
}

@Injectable({providedIn: 'root'})
export class UnauthenticatedOnlyRouteGuard implements CanActivate {
  constructor(private authenticationService: AuthenticationService,
              private i18nService: I18nService,
              private router: Router) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (this.authenticationService.isUserSignedIn()) {
      this.router.navigate([this.i18nService.currentLanguage.code]);
      return false;
    }
    return true;
  }
}

@Injectable({providedIn: 'root'})
export class AuthenticatedOnlyRouteGuard implements CanActivate {
  constructor(private authenticationService: AuthenticationService,
              private i18nService: I18nService,
              private router: Router) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (this.authenticationService.isUserSignedIn()) {
      return true;
    }
    this.router.navigate([this.i18nService.currentLanguage.code, 'signin']);
    return false;
  }
}
