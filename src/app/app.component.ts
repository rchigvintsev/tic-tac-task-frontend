import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {NavigationEnd, PRIMARY_OUTLET, Router, RouterEvent, UrlSegment} from '@angular/router';
import {MediaMatcher} from '@angular/cdk/layout';
import {MatSidenav} from '@angular/material/sidenav';

import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

import {LangChangeEvent} from '@ngx-translate/core';

import * as moment from 'moment';

import {I18nService, Language} from './service/i18n.service';
import {AuthenticationService} from './service/authentication.service';
import {TaskGroupService} from './service/task-group.service';
import {User} from './model/user';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [TaskGroupService]
})
export class AppComponent implements OnInit, OnDestroy {
  @ViewChild('sidenav')
  sidenav: MatSidenav;

  title = 'Toledo';
  mobileQuery: MediaQueryList;
  showSidenav = false;
  availableLanguages: Language[];
  authenticatedUser: User;

  private componentDestroyed = new Subject<boolean>();

  constructor(public i18nService: I18nService,
              private router: Router,
              private authenticationService: AuthenticationService,
              media: MediaMatcher) {
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
  }

  private static isErrorPage(url: string): boolean {
    return /^(\/[a-z]{2})?\/error(\/.*)?$/.test(url);
  }

  private static isAccountPage(url: string): boolean {
    return /^(\/[a-z]{2})?\/account$/.test(url);
  }

  private static isAdminAreaPage(url: string): boolean {
    return /^(\/[a-z]{2})?\/admin$/.test(url);
  }

  ngOnInit() {
    this.availableLanguages = this.i18nService.availableLanguages;
    this.authenticatedUser = this.authenticationService.getAuthenticatedUser();

    moment.locale(this.i18nService.currentLanguage.code);
    this.i18nService.onLanguageChange
      .pipe(takeUntil(this.componentDestroyed))
      .subscribe((event: LangChangeEvent) => moment.locale(event.lang));
    this.authenticationService.onAuthenticatedUserChange
      .pipe(takeUntil(this.componentDestroyed))
      .subscribe(user => this.onAuthenticatedUserChange(user));
    this.router.events.subscribe((event: RouterEvent) => this.onRouterEvent(event));
  }

  ngOnDestroy(): void {
    this.componentDestroyed.next(true);
    this.componentDestroyed.complete();
  }

  get currentLanguage(): Language {
    return this.i18nService.currentLanguage;
  }

  onSignOutButtonClick() {
    this.authenticationService.signOut()
      .pipe(takeUntil(this.componentDestroyed))
      .subscribe(() => this.router.navigate([this.i18nService.currentLanguage.code, 'signin']).then());
  }

  onSidenavToggleButtonClick() {
    this.sidenav.toggle().then();
  }

  onLanguageButtonClick(language: Language) {
    this.switchLanguage(language);
  }

  onRouterEvent(event: RouterEvent) {
    if (event instanceof NavigationEnd && event.url) {
      this.showSidenav = this.authenticatedUser && !(
        AppComponent.isErrorPage(event.url)
        || AppComponent.isAccountPage(event.url)
        || AppComponent.isAdminAreaPage(event.url)
      );
    }
  }

  private switchLanguage(language: Language) {
    let languageChanged = false;
    let urlTree = this.router.parseUrl(this.router.url);
    if (urlTree.root.numberOfChildren === 0) {
      urlTree = this.router.createUrlTree([language.code], {
        fragment: urlTree.fragment,
        queryParams: urlTree.queryParams
      });
      languageChanged = true;
    } else {
      const segmentGroup = urlTree.root.children[PRIMARY_OUTLET];
      const currentLangCode = segmentGroup.segments[0].path;
      if (!this.i18nService.languageForCode(currentLangCode)) {
        segmentGroup.segments.unshift(new UrlSegment(language.code, {}));
        languageChanged = true;
      } else if (currentLangCode !== language.code) {
        segmentGroup.segments[0] = new UrlSegment(language.code, {});
        languageChanged = true;
      }
    }

    if (languageChanged) {
      this.router.navigateByUrl(urlTree).then();
    }
  }

  private onAuthenticatedUserChange(user: User) {
    this.authenticatedUser = user;
  }
}

