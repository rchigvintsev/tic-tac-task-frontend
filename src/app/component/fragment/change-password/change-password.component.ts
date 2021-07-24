import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';

import {I18nService} from '../../../service/i18n.service';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit {
  @Input()
  submitButtonLabel: string;
  @Input()
  submitButtonWidth = 'auto';
  @Input()
  currentPasswordRequired = true;

  @ViewChild('changePasswordForm', {read: NgForm})
  changePasswordForm: NgForm;

  currentPassword: string;
  newPassword: string;
  newPasswordRepeated: string;

  @Output()
  passwordChange = new EventEmitter<PasswordChangeEvent>();

  constructor(i18nService: I18nService) {
    this.submitButtonLabel = i18nService.translate('post');
  }

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

  set currentPasswordValid(currentPasswordValid: boolean) {
    const currentPasswordCtrl = this.changePasswordForm.controls.currentPassword;
    if (currentPasswordCtrl) {
      if (currentPasswordValid) {
        currentPasswordCtrl.setErrors(null);
      } else {
        currentPasswordCtrl.setErrors({valid: 'Invalid password'});
      }
      currentPasswordCtrl.markAsTouched();
    }
  }
}

export class PasswordChangeEvent {
  constructor(public currentPassword: string, public newPassword: string) {
  }
}
