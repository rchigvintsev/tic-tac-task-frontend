import {Directive} from '@angular/core';
import {AbstractControl, FormGroup, NG_VALIDATORS, ValidationErrors, Validator, ValidatorFn} from '@angular/forms';

import {Strings} from '../util/strings';

function isControlDirty(control: AbstractControl): boolean {
  return control && control.dirty;
}

function passwordsMatchValidator(): ValidatorFn {
  return (form: FormGroup): ValidationErrors => {
    const passwordControl = form.controls.password;
    const passwordRepeatControl = form.controls['password-repeat'];

    if (isControlDirty(passwordControl) && isControlDirty(passwordRepeatControl)) {
      const password = passwordControl.value;
      const repeatedPassword = passwordRepeatControl.value;
      if (password !== repeatedPassword) {
        passwordControl.markAsTouched();
        passwordControl.setErrors({passwordsMatch: true});
        passwordRepeatControl.markAsTouched();
        passwordRepeatControl.setErrors({passwordsMatch: true});
      } else {
        passwordControl.setErrors({passwordsMatch: false});
        passwordRepeatControl.setErrors({passwordsMatch: false});
        if (!Strings.isBlank(password)) {
          passwordControl.markAsUntouched();
        }
        if (!Strings.isBlank(repeatedPassword)) {
          passwordRepeatControl.markAsUntouched();
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
