import {Directive} from '@angular/core';
import {FormGroup, NG_VALIDATORS, ValidationErrors, Validator, ValidatorFn} from '@angular/forms';

function passwordsMatchValidator(): ValidatorFn {
  return (form: FormGroup): ValidationErrors => {
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
