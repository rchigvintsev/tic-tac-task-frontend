import {Component, DoCheck, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, NavigationEnd, Router, RouterEvent} from '@angular/router';
import {MediaMatcher} from '@angular/cdk/layout';
import {MatSidenav} from '@angular/material/sidenav';

import {LangChangeEvent, TranslateService} from '@ngx-translate/core';

import * as moment from 'moment';

import {AuthenticationService} from './service/authentication.service';
import {AuthenticatedPrincipal} from './security/authenticated-principal';
import {TaskGroup} from './tasks/task-group';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.styl']
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

  onSidenavListItemClick(selectedTaskGroup: TaskGroup) {
    this.selectedTaskGroup = selectedTaskGroup;
  }

  onUrlFragmentChange(fragment: string) {
    if (fragment) {
      let taskGroup = TaskGroup.valueOf(fragment);
      if (!taskGroup) {
        taskGroup = TaskGroup.TODAY;
      }
      this.selectedTaskGroup = taskGroup;
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
}

