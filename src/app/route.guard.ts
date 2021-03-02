import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlSegment} from '@angular/router';

import {I18nService} from './service/i18n.service';
import {AuthenticationService} from './service/authentication.service';

@Injectable({providedIn: 'root'})
export class LocalizedRouteGuard implements CanActivate {
  constructor(private i18nService: I18nService, private router: Router) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const lang = this.getLanguageFromUrl(route.url);
    if (lang != null) {
      this.navigateTo404Page(lang);
    } else {
      this.navigateToTargetPage(this.i18nService.currentLanguage.code, route);
    }
    return true;
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

  private navigateToTargetPage(language: string, route: ActivatedRouteSnapshot) {
    const commands = [language];
    for (const segment of route.url) {
      commands.push(segment.path);
    }
    this.router.navigate(commands, {queryParams: route.queryParams}).then();
  }

  private navigateTo404Page(language: string) {
    this.router.navigate([language, 'error', '404']).then();
  }
}

@Injectable({
  providedIn: 'root'
})
export class OAuth2AuthorizationCallbackRouteGuard implements CanActivate {
  constructor(private authenticationService: AuthenticationService,
              private i18nService: I18nService,
              private router: Router) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const currentLang = this.i18nService.currentLanguage;
    if (route.queryParamMap.get('error')) {
      this.router.navigate([currentLang.code, 'signin'], {queryParams: {error: true}}).then();
    } else {
      const encodedClaims = route.queryParamMap.get('access_token_claims');
      if (encodedClaims) {
        const claims = this.authenticationService.parseAccessTokenClaims(encodedClaims);
        const principal = this.authenticationService.createPrincipal(claims);
        this.authenticationService.setPrincipal(principal);
      }
      this.router.navigate([currentLang.code]).then();
    }
    return true;
  }
}

@Injectable({
  providedIn: 'root'
})
export class UnauthenticatedOnlyRouteGuard implements CanActivate {
  constructor(private authenticationService: AuthenticationService,
              private i18nService: I18nService,
              private router: Router) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (this.authenticationService.isUserSignedIn()) {
      this.router.navigate([this.i18nService.currentLanguage.code]).then();
      return false;
    }
    return true;
  }
}

@Injectable({
  providedIn: 'root'
})
export class AuthenticatedOnlyRouteGuard implements CanActivate {
  constructor(private authenticationService: AuthenticationService,
              private i18nService: I18nService,
              private router: Router) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (this.authenticationService.isUserSignedIn()) {
      return true;
    }
    this.router.navigate([this.i18nService.currentLanguage.code, 'signin']).then();
    return false;
  }
}
