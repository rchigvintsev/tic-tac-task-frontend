import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlSegment} from '@angular/router';

import {TranslateService} from '@ngx-translate/core';

import {AuthenticationService} from './service/authentication.service';
import {AVAILABLE_LANGUAGES} from './language';

@Injectable({
  providedIn: 'root'
})
export class LocalizedRouteGuard implements CanActivate {
  constructor(private translate: TranslateService, private router: Router) {
  }

  private static getLanguageFromUrl(url: UrlSegment[]): string {
    if (url.length > 0) {
      const firstSegment = url[0];
      if (AVAILABLE_LANGUAGES.includes(firstSegment.path)) {
        return firstSegment.path;
      }
    }
    return null;
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const lang = LocalizedRouteGuard.getLanguageFromUrl(route.url);
    if (lang != null) {
      this.navigateTo404Page(lang);
    } else {
      this.navigateToTargetPage(this.translate.currentLang, route.url);
    }
    return true;
  }

  private navigateToTargetPage(language: string, url: UrlSegment[]) {
    const commands = [language];
    for (const segment of url) {
      commands.push(segment.path);
    }
    this.router.navigate(commands).then();
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
              private translate: TranslateService,
              private router: Router) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (route.queryParamMap.get('error')) {
      this.router.navigate([this.translate.currentLang, 'signin'], {queryParams: {error: true}}).then();
    } else {
      const encodedClaims = route.queryParamMap.get('claims');
      if (encodedClaims) {
        const principal = this.authenticationService.createPrincipal(encodedClaims);
        this.authenticationService.setPrincipal(principal);
      }
      this.router.navigate([this.translate.currentLang]).then();
    }
    return true;
  }
}

@Injectable({
  providedIn: 'root'
})
export class UnauthenticatedOnlyRouteGuard implements CanActivate {
  constructor(private authenticationService: AuthenticationService,
              private translate: TranslateService,
              private router: Router) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (this.authenticationService.isUserSignedIn()) {
      this.router.navigate([this.translate.currentLang]).then();
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
              private translate: TranslateService,
              private router: Router) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (this.authenticationService.isUserSignedIn()) {
      return true;
    }
    this.router.navigate([this.translate.currentLang, 'signin']).then();
    return false;
  }
}
