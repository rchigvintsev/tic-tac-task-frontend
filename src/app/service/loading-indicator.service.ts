import {Injectable} from '@angular/core';
import {MatDialog, MatDialogRef} from '@angular/material';

import {Observable} from 'rxjs';
import {finalize} from 'rxjs/operators';

import {LoadingIndicatorComponent} from '../component/fragment/loading-indicator/loading-indicator.component';

@Injectable({providedIn: 'root'})
export class LoadingIndicatorService {
  private executingObservables = 0;
  private dialogRef: MatDialogRef<LoadingIndicatorComponent> = null;

  constructor(private dialog: MatDialog) {
  }

  showUntilExecuted(observable: Observable<any>) {
    if (this.executingObservables === 0) {
      this.dialogRef = this.dialog.open(LoadingIndicatorComponent, {
        panelClass: 'progress-spinner-dialog',
        disableClose: true
      });
    }

    this.executingObservables++;
    return observable.pipe(finalize(() => {
      this.executingObservables--;
      if (this.executingObservables === 0 && this.dialogRef) {
        this.dialogRef.close();
        this.dialogRef = null;
      }
    }));
  }
}
