import {Injectable} from '@angular/core';
import {MatDialog, MatDialogRef} from '@angular/material';

import {Observable, ReplaySubject, Subject} from 'rxjs';
import {finalize} from 'rxjs/operators';

import {LoadingIndicatorComponent} from '../component/fragment/loading-indicator/loading-indicator.component';

@Injectable({providedIn: 'root'})
export class LoadingIndicatorService {
  private executingObservables = 0;
  private dialogRefSubject: Subject<MatDialogRef<LoadingIndicatorComponent>>;

  constructor(private dialog: MatDialog) {
  }

  showUntilExecuted(observable: Observable<any>) {
    this.executingObservables++;
    if (this.executingObservables === 1) {
      this.dialogRefSubject = new ReplaySubject<MatDialogRef<LoadingIndicatorComponent>>();
      setTimeout(() => {
        if (this.executingObservables > 0) {
          const dialogRef = this.dialog.open(LoadingIndicatorComponent, {
            panelClass: 'progress-spinner-dialog',
            disableClose: true
          });
          this.dialogRefSubject.next(dialogRef);
        }
        this.dialogRefSubject.complete();
      }, 200);
    }

    return observable.pipe(finalize(() => {
      this.executingObservables--;
      if (this.executingObservables === 0) {
        this.dialogRefSubject.subscribe(dialogRef => dialogRef.close());
      }
    }));
  }
}
