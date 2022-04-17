import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';

import {I18nService} from '../../../../../service/i18n.service';

@Component({
  selector: 'app-account-password-change',
  templateUrl: './account-password-change.component.html',
  styleUrls: ['./account-password-change.component.scss']
})
export class AccountPasswordChangeComponent implements OnInit {
  @Input()
  submitButtonLabel: string;
  @Input()
  submitButtonMinWidth = 'auto';
  @Input()
  currentPasswordRequired = true;

  @ViewChild('passwordChangeForm', {read: NgForm})
  passwordChangeForm: NgForm;

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

  onPasswordChangeFormSubmit() {
    if (this.passwordChangeForm.valid) {
      this.passwordChange.emit(new PasswordChangeEvent(this.currentPassword, this.newPassword));
    }
  }

  reset() {
    this.passwordChangeForm.resetForm();
  }

  set currentPasswordValid(currentPasswordValid: boolean) {
    const currentPasswordCtrl = this.passwordChangeForm.controls.currentPassword;
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
