import {Directive} from '@angular/core';
import {AbstractControl, NG_VALIDATORS, Validator, ValidatorFn} from '@angular/forms';

import {Strings} from '../util/strings';

function notBlankValidator(): ValidatorFn {
  return (control: AbstractControl): {[key: string]: any} | null => {
    if (control.dirty && Strings.isBlank(control.value)) {
      control.markAsTouched();
      return {notBlank: {}};
    }
    return null;
  };
}

@Directive({
  // tslint:disable-next-line:directive-selector
  selector: '[notBlank]',
  providers: [{provide: NG_VALIDATORS, useExisting: NotBlankValidatorDirective, multi: true}]
})
export class NotBlankValidatorDirective implements Validator {
  validate(control: AbstractControl): {[key: string]: any} | null {
    return notBlankValidator()(control);
  }
}
