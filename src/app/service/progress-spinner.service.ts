import {Injectable} from '@angular/core';
import {MatDialog, MatDialogRef} from '@angular/material';

import {Observable} from 'rxjs';

import {ProgressSpinnerDialogComponent} from '../component/fragment/progress-spinner-dialog/progress-spinner-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class ProgressSpinnerService {
  constructor(private dialog: MatDialog) {
  }

  showUntilExecuted(observable: Observable<any>, onSuccess: (result) => any, onError: (error) => any = null) {
    const dialogRef: MatDialogRef<ProgressSpinnerDialogComponent> = this.dialog.open(ProgressSpinnerDialogComponent, {
      panelClass: 'progress-spinner-dialog',
      disableClose: true
    });
    const subscription = observable.subscribe(
      result => {
        subscription.unsubscribe();
        onSuccess(result);
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
