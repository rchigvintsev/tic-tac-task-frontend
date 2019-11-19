import {Component, Inject, OnInit} from '@angular/core';
import {Router} from '@angular/router';

import {LangChangeEvent, TranslateService} from '@ngx-translate/core';
import * as moment from 'moment';

import {User} from './model/user';
import {AuthenticationService, CURRENT_USER} from './service/authentication.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.styl']
})
export class AppComponent implements OnInit {
  title = 'Orchestra';

  constructor(private router: Router,
              private translate: TranslateService,
              private authenticationService: AuthenticationService,
              @Inject(CURRENT_USER) public user: User) {
  }

  ngOnInit() {
    moment.locale(this.translate.currentLang);
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      moment.locale(event.lang);
    });
  }

  onSignOutButtonClick() {
    this.authenticationService.signOut().subscribe(() => {
      this.user = null;
      this.router.navigate([this.translate.currentLang, 'login']).then();
    });
  }
}
