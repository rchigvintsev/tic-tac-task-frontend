import {Component, Inject, OnInit} from '@angular/core';

import {LangChangeEvent, TranslateService} from '@ngx-translate/core';
import * as moment from 'moment';

import {User} from './model/user';
import {CURRENT_USER} from './service/authentication.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.styl']
})
export class AppComponent implements OnInit {
  title = 'Orchestra';

  constructor(private translate: TranslateService, @Inject(CURRENT_USER) public user: User) {
  }

  ngOnInit() {
    moment.locale(this.translate.currentLang);
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      moment.locale(event.lang);
    });
  }
}
