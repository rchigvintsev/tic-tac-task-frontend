import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-password-reset',
  templateUrl: './password-reset.component.html',
  styleUrls: ['./password-reset.component.styl']
})
export class PasswordResetComponent implements OnInit {
  email: string;

  constructor() {
  }

  ngOnInit() {
  }

  onPasswordResetFormSubmit() {

  }
}
