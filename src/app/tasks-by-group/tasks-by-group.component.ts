import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';

import {TranslateService} from '@ngx-translate/core';

import {WebServiceBasedComponent} from '../web-service-based.component';
import {AuthenticationService} from '../service/authentication.service';
import {LogService} from '../service/log.service';

@Component({
  selector: 'app-tasks-by-group',
  templateUrl: './tasks-by-group.component.html',
  styleUrls: ['./tasks-by-group.component.styl']
})
export class TasksByGroupComponent extends WebServiceBasedComponent implements OnInit {
  constructor(translate: TranslateService,
              router: Router,
              authenticationService: AuthenticationService,
              log: LogService) {
    super(translate, router, authenticationService, log);
  }

  ngOnInit() {
  }
}
