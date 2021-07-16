import {Component, EventEmitter, OnInit, Output, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit {
  @ViewChild('changePasswordForm', {read: NgForm})
  changePasswordForm: NgForm;

  currentPassword: string;
  newPassword: string;
  newPasswordRepeated: string;

  @Output()
  passwordChange = new EventEmitter<PasswordChangeEvent>();

  ngOnInit(): void {
  }

  onChangePasswordFormSubmit() {
    if (this.changePasswordForm.valid) {
      this.passwordChange.emit(new PasswordChangeEvent(this.currentPassword, this.newPassword));
    }
  }

  reset() {
    this.changePasswordForm.resetForm();
  }
}

export class PasswordChangeEvent {
  constructor(public currentPassword: string, public newPassword: string) {
  }
}
