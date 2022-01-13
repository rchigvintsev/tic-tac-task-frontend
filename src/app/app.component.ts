import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {NavigationEnd, PRIMARY_OUTLET, Router, RouterEvent, UrlSegment} from '@angular/router';
import {MediaMatcher} from '@angular/cdk/layout';
import {MatSidenav} from '@angular/material/sidenav';
import {MatDialog} from '@angular/material/dialog';

import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

import {LangChangeEvent} from '@ngx-translate/core';

import * as moment from 'moment';

import {AccountDialogComponent} from './component/fragment/account-dialog/account-dialog.component';
import {I18nService, Language} from './service/i18n.service';
import {AuthenticationService} from './service/authentication.service';
import {TaskGroupService} from './service/task-group.service';
import {User} from './model/user';
import {ViewportMediaQueries} from './util/viewport-media-queries';
import {Routes} from './util/routes';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [TaskGroupService]
})
export class AppComponent implements OnInit, OnDestroy {
  @ViewChild('sidenav')
  sidenav: MatSidenav;

  title = 'TicTacTask';
  xsQuery: MediaQueryList;
  showSidenav = false;
  adminArea = false;
  availableLanguages: Language[];
  authenticatedUser: User;

  private componentDestroyed = new Subject<boolean>();

  constructor(public i18nService: I18nService,
              private router: Router,
              private authenticationService: AuthenticationService,
              private media: MediaMatcher,
              private dialog: MatDialog) {
    this.xsQuery = media.matchMedia(ViewportMediaQueries.XS);
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

  onAccountSettingsButtonClick() {
    const width = this.xsQuery.matches ? '320px' : '700px';
    this.dialog.open(AccountDialogComponent, {minWidth: width});
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
      this.showSidenav = this.authenticatedUser && !Routes.isError(event.url);
      this.adminArea = this.authenticatedUser && Routes.isAdminArea(event.url);
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

