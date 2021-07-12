import {Directive} from '@angular/core';
import {AbstractControl, FormGroup, NG_VALIDATORS, ValidationErrors, Validator, ValidatorFn} from '@angular/forms';

import {Strings} from '../util/strings';

function isControlDirty(control: AbstractControl): boolean {
  return control && control.dirty;
}

function passwordsMatchValidator(): ValidatorFn {
  return (form: FormGroup): ValidationErrors => {
    const newPasswordControl = form.controls.newPassword;
    const newPasswordRepeatControl = form.controls.newPasswordRepeat;

    if (isControlDirty(newPasswordControl) && isControlDirty(newPasswordRepeatControl)) {
      const newPassword = newPasswordControl.value;
      const repeatedNewPassword = newPasswordRepeatControl.value;
      if (newPassword !== repeatedNewPassword) {
        newPasswordControl.markAsTouched();
        newPasswordControl.setErrors({passwordsMatch: true});
        newPasswordRepeatControl.markAsTouched();
        newPasswordRepeatControl.setErrors({passwordsMatch: true});
      } else {
        if (!Strings.isBlank(newPassword)) {
          newPasswordControl.setErrors(null);
          newPasswordControl.markAsUntouched();
        }

        if (!Strings.isBlank(repeatedNewPassword)) {
          newPasswordRepeatControl.setErrors(null);
          newPasswordRepeatControl.markAsUntouched();
        }
      }
    }
    return null;
  };
}

@Directive({
  // tslint:disable-next-line:directive-selector
  selector: '[passwordsMatch]',
  providers: [{provide: NG_VALIDATORS, useExisting: PasswordsMatchValidatorDirective, multi: true}]
})
export class PasswordsMatchValidatorDirective implements Validator {
  validate(form: FormGroup): ValidationErrors {
    return passwordsMatchValidator()(form);
  }
}
