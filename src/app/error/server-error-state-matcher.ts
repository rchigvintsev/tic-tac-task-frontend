import {ErrorStateMatcher} from '@angular/material/core';
import {FormControl, FormGroupDirective, NgForm} from '@angular/forms';

export class ServerErrorStateMatcher implements ErrorStateMatcher {
  errorState: boolean;

  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    return this.errorState;
  }
}
