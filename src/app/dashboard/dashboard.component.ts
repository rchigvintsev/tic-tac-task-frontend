import {Component} from '@angular/core';
import {Router} from '@angular/router';

import {TranslateService} from '@ngx-translate/core';

import {AbstractComponent} from '../abstract-component';
import {LogService} from '../service/log.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.styl']
})
export class DashboardComponent extends AbstractComponent {
  constructor(router: Router, translate: TranslateService, log: LogService) {
    super(router, translate, log);
  }
}
