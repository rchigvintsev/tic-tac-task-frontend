import {Component, DoCheck, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, NavigationEnd, PRIMARY_OUTLET, Router, RouterEvent, UrlSegment} from '@angular/router';
import {MediaMatcher} from '@angular/cdk/layout';
import {MatSidenav} from '@angular/material/sidenav';

import {LangChangeEvent, TranslateService} from '@ngx-translate/core';

import * as moment from 'moment';

import {TaskGroup} from './service/task-group';
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
  todayDate = moment().date();
  tomorrowDate = moment().add(1, 'days').date();
  mobileQuery: MediaQueryList;
  showSidenav = false;

  TaskGroup = TaskGroup;

  private selectedTaskGroup = TaskGroup.INBOX;

  constructor(private router: Router,
              private route: ActivatedRoute,
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
    this.taskGroupService.notifyTaskGroupSelected(this.selectedTaskGroup);
    this.route.fragment.subscribe((fragment: string) => this.onUrlFragmentChange(fragment));
    this.router.events.subscribe((event: RouterEvent) => this.onRouterEvent(event));
  }

  ngDoCheck(): void {
    if (!this.principal) {
      this.principal = AuthenticationService.getPrincipal();
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

  onSidenavListItemClick(taskGroup: TaskGroup) {
    this.setSelectedTaskGroup(taskGroup);
  }

  onLanguageSwitchButtonClick(language: string) {
    this.switchLanguage(language);
  }

  onUrlFragmentChange(fragment: string) {
    if (fragment) {
      let taskGroup = TaskGroup.valueOf(fragment);
      if (!taskGroup) {
        taskGroup = TaskGroup.TODAY;
      }
      this.setSelectedTaskGroup(taskGroup);
    }
  }

  onRouterEvent(event: RouterEvent) {
    if (event instanceof NavigationEnd && event.url) {
      this.showSidenav = this.principal && !AppComponent.isErrorPage(event.url);
    }
  }

  anchorFor(taskGroup: TaskGroup) {
    return `/${this.translate.currentLang}#${taskGroup.value}`;
  }

  isTaskGroupSelected(taskGroup: TaskGroup) {
    return this.selectedTaskGroup === taskGroup;
  }

  private setSelectedTaskGroup(taskGroup: TaskGroup) {
    if (this.selectedTaskGroup !== taskGroup) {
      this.selectedTaskGroup = taskGroup;
      this.taskGroupService.notifyTaskGroupSelected(taskGroup);
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

