import {Component, OnInit} from '@angular/core';

import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-error-not-found',
  templateUrl: './error-not-found.component.html',
  styleUrls: ['./error-not-found.component.styl']
})
export class ErrorNotFoundComponent implements OnInit {
  constructor(public translate: TranslateService) {
  }

  ngOnInit() {
  }
}
