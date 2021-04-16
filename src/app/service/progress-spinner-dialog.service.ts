import {Injectable} from '@angular/core';
import {MatDialog, MatDialogRef} from '@angular/material';

import {Observable} from 'rxjs';
import {defaultIfEmpty} from 'rxjs/operators';

import {ProgressSpinnerDialogComponent} from '../component/fragment/progress-spinner-dialog/progress-spinner-dialog.component';
import {HttpRequestError} from '../error/http-request.error';

const EMPTY_MARKER = Symbol.for('empty');

@Injectable({providedIn: 'root'})
export class ProgressSpinnerDialogService {
  constructor(private dialog: MatDialog) {
  }

  showUntilExecuted(observable: Observable<any>,
                    onSuccess: (result) => any,
                    onError: (error: HttpRequestError) => any = null) {
    const dialogRef: MatDialogRef<ProgressSpinnerDialogComponent> = this.dialog.open(ProgressSpinnerDialogComponent, {
      panelClass: 'progress-spinner-dialog',
      disableClose: true
    });
    const subscription = observable.pipe(defaultIfEmpty(EMPTY_MARKER)).subscribe(
      result => {
        subscription.unsubscribe();
        if (result !== EMPTY_MARKER) {
          onSuccess(result);
        }
        dialogRef.close();
      },
      error => {
        subscription.unsubscribe();
        if (onError) {
          onError(error);
        }
        dialogRef.close();
      }
    );
  }
}
