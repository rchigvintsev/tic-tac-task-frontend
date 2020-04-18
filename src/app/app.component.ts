import {Component, DoCheck, OnInit, ViewChild} from '@angular/core';
import {NavigationEnd, PRIMARY_OUTLET, Router, RouterEvent, UrlSegment} from '@angular/router';
import {MediaMatcher} from '@angular/cdk/layout';
import {MatSidenav} from '@angular/material/sidenav';

import {LangChangeEvent, TranslateService} from '@ngx-translate/core';

import * as moment from 'moment';

import {TaskGroupService} from './service/task-group.service';
import {AuthenticationService} from './service/authentication.service';
import {AuthenticatedPrincipal} from './security/authenticated-principal';
import {AVAILABLE_LANGUAGES} from './language';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.styl'],
  providers: [TaskGroupService]
})
export class AppComponent implements OnInit, DoCheck {
  @ViewChild('sidenav')
  sidenav: MatSidenav;

  title = 'Orchestra';
  principal: AuthenticatedPrincipal;
  mobileQuery: MediaQueryList;
  showSidenav = false;

  constructor(private router: Router,
              private translate: TranslateService,
              private authenticationService: AuthenticationService,
              private taskGroupService: TaskGroupService,
              media: MediaMatcher) {
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
  }

  private static isErrorPage(url: string): boolean {
    return /^(\/[a-z]{2})?\/error(\/.*)?$/.test(url);
  }

  ngOnInit() {
    moment.locale(this.translate.currentLang);
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      moment.locale(event.lang);
    });
    this.router.events.subscribe((event: RouterEvent) => this.onRouterEvent(event));
  }

  ngDoCheck(): void {
    if (!this.principal) {
      this.principal = this.authenticationService.getPrincipal();
    }
  }

  onSignOutButtonClick() {
    this.authenticationService.signOut().subscribe(() => {
      this.principal = null;
      this.router.navigate([this.translate.currentLang, 'signin']).then();
    });
  }

  onSidenavToggleButtonClick() {
    this.sidenav.toggle().then();
  }

  onLanguageSwitchButtonClick(language: string) {
    this.switchLanguage(language);
  }

  onRouterEvent(event: RouterEvent) {
    if (event instanceof NavigationEnd && event.url) {
      this.showSidenav = this.principal && !AppComponent.isErrorPage(event.url);
    }
  }

  private switchLanguage(language: string) {
    let languageChanged = false;
    let urlTree = this.router.parseUrl(this.router.url);
    if (urlTree.root.numberOfChildren === 0) {
      urlTree = this.router.createUrlTree([language], {fragment: urlTree.fragment, queryParams: urlTree.queryParams});
      languageChanged = true;
    } else {
      const segmentGroup = urlTree.root.children[PRIMARY_OUTLET];
      const currentLanguage = segmentGroup.segments[0].path;
      if (!AVAILABLE_LANGUAGES.includes(currentLanguage)) {
        segmentGroup.segments.unshift(new UrlSegment(language, {}));
        languageChanged = true;
      } else if (currentLanguage !== language) {
        segmentGroup.segments[0] = new UrlSegment(language, {});
        languageChanged = true;
      }
    }

    if (languageChanged) {
      this.router.navigateByUrl(urlTree).then();
    }
  }
}

