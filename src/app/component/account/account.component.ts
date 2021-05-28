import {Component, OnInit} from '@angular/core';

import {AuthenticatedPrincipal} from '../../security/authenticated-principal';
import {AuthenticationService} from '../../service/authentication.service';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss']
})
export class AccountComponent implements OnInit {
  constructor(private authenticationService: AuthenticationService) {
  }

  ngOnInit(): void {
  }

  get principal(): AuthenticatedPrincipal {
    return this.authenticationService.getPrincipal();
  }
}
