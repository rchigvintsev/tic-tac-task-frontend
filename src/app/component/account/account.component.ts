import {Component, OnInit} from '@angular/core';

import {I18nService} from '../../service/i18n.service';
import {AuthenticationService} from '../../service/authentication.service';
import {User} from '../../model/user';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss']
})
export class AccountComponent implements OnInit {
  userFormModel = new User();

  constructor(public i18nService: I18nService, private authenticationService: AuthenticationService) {
    const principal = authenticationService.getPrincipal();
    this.userFormModel.fullName = principal.getName();
  }

  ngOnInit(): void {
  }
}
