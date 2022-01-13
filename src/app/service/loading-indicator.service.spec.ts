import {fakeAsync, getTestBed, TestBed, tick} from '@angular/core/testing';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';

import {delay} from 'rxjs/operators';
import {of, Subject} from 'rxjs';

import {TestSupport} from '../test/test-support';
import {LoadingIndicatorService} from './loading-indicator.service';

describe('LoadingIndicatorService', () => {
  let injector: TestBed;
  let service: LoadingIndicatorService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: TestSupport.IMPORTS,
      declarations: TestSupport.DECLARATIONS
    });
    injector = getTestBed();
    service = injector.inject(LoadingIndicatorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should show loading indicator', fakeAsync(() => {
    const dialog = injector.inject(MatDialog);
    spyOn(dialog, 'open').and.returnValue({close: () => {}} as MatDialogRef<any>);

    service.showUntilExecuted(of(true));
    tick(1000);
    expect(dialog.open).toHaveBeenCalled();
  }));

  it('should not show loading indicator if it is being shown already', fakeAsync(() => {
    const dialog = injector.inject(MatDialog);
    spyOn(dialog, 'open').and.returnValue({close: () => {}}  as MatDialogRef<any>);

    service.showUntilExecuted(of(true));
    tick(1000);
    service.showUntilExecuted(of(false));
    tick(1000);
    expect(dialog.open).toHaveBeenCalledTimes(1);
  }));

  it('should hide loading indicator on execution complete', fakeAsync(() => {
    const dialogRef = {} as any;
    dialogRef.close = jasmine.createSpy('close');

    const dialog = injector.inject(MatDialog);
    spyOn(dialog, 'open').and.returnValue(dialogRef);

    service.showUntilExecuted(of(true).pipe(delay(500))).subscribe();
    tick(1000);
    expect(dialogRef.close).toHaveBeenCalled();
  }));

  it('should hide loading indicator on last execution complete', fakeAsync(() => {
    const dialogRef = {} as any;
    dialogRef.close = jasmine.createSpy('close');

    const dialog = injector.inject(MatDialog);
    spyOn(dialog, 'open').and.returnValue(dialogRef);

    const subject1 = new Subject();
    service.showUntilExecuted(subject1).subscribe();
    tick(1000);

    const subject2 = new Subject();
    service.showUntilExecuted(subject2).subscribe();
    tick(1000);

    subject1.complete();
    expect(dialogRef.close).not.toHaveBeenCalled();

    subject2.complete();
    expect(dialogRef.close).toHaveBeenCalled();
  }));
});
