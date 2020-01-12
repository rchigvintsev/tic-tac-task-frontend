import {Component, DoCheck, OnInit} from '@angular/core';
import {Router} from '@angular/router';

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
  title = 'Orchestra';
  principal: AuthenticatedPrincipal;

  constructor(private router: Router,
              private translate: TranslateService,
              private authenticationService: AuthenticationService) {
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
}
