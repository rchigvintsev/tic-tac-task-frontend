import {Directive} from '@angular/core';
import {AbstractControl, NG_VALIDATORS, Validator, ValidatorFn} from '@angular/forms';

import {Strings} from '../util/strings';

function notBlankValidator(): ValidatorFn {
  return (control: AbstractControl): {[key: string]: any} | null => {
    if (Strings.isBlank(control.value)) {
      control.markAsTouched();
      return {'notBlank': {}}
    }
    return null;
  }
}

@Directive({
  selector: '[notBlank]',
  providers: [{provide: NG_VALIDATORS, useExisting: NotBlankValidatorDirective, multi: true}]
})
export class NotBlankValidatorDirective implements Validator {
  validate(control: AbstractControl): {[key: string]: any} | null {
    return notBlankValidator()(control);
  }
}
