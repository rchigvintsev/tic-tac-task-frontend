import {Component, OnInit} from '@angular/core';
import {I18nService} from '../../service/i18n.service';

@Component({
  selector: 'app-error-not-found',
  templateUrl: './error-not-found.component.html',
  styleUrls: ['./error-not-found.component.scss']
})
export class ErrorNotFoundComponent implements OnInit {
  constructor(public i18nService: I18nService) {
  }

  ngOnInit() {
  }
}
