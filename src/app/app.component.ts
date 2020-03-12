import {Component, DoCheck, OnInit, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {MediaMatcher} from '@angular/cdk/layout';
import {MatSidenav} from '@angular/material/sidenav';

import {LangChangeEvent, TranslateService} from '@ngx-translate/core';

import * as moment from 'moment';

import {AuthenticationService} from './service/authentication.service';
import {AuthenticatedPrincipal} from './security/authenticated-principal';

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

  constructor(private router: Router,
              private translate: TranslateService,
              private authenticationService: AuthenticationService,
              media: MediaMatcher) {
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
  }

  ngOnInit() {
    moment.locale(this.translate.currentLang);
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      moment.locale(event.lang);
    });
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
}
