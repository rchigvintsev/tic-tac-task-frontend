import {getTestBed, TestBed} from '@angular/core/testing';
import {MatDialog} from '@angular/material';

import {of, Subject} from 'rxjs';

import {TestSupport} from '../test/test-support';
import {LoadingIndicatorService} from './loading-indicator.service';

fdescribe('LoadingIndicatorService', () => {
  let injector: TestBed;
  let service: LoadingIndicatorService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: TestSupport.IMPORTS,
      declarations: TestSupport.DECLARATIONS
    });
    injector = getTestBed();
    service = injector.get(LoadingIndicatorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should show loading indicator', () => {
    const dialog = injector.get(MatDialog);
    spyOn(dialog, 'open').and.returnValue({close: () => {}});

    service.showUntilExecuted(of(true));
    expect(dialog.open).toHaveBeenCalled();
  });

  it('should not show loading indicator if it is being shown already', () => {
    const dialog = injector.get(MatDialog);
    spyOn(dialog, 'open').and.returnValue({close: () => {}});

    service.showUntilExecuted(of(true));
    service.showUntilExecuted(of(false));
    expect(dialog.open).toHaveBeenCalledTimes(1);
  });

  it('should hide loading indicator on execution complete', () => {
    const dialogRef = {} as any;
    dialogRef.close = jasmine.createSpy('close');

    const dialog = injector.get(MatDialog);
    spyOn(dialog, 'open').and.returnValue(dialogRef);

    service.showUntilExecuted(of(true)).subscribe();
    expect(dialogRef.close).toHaveBeenCalled();
  });

  it('should hide loading indicator on last execution complete', () => {
    const dialogRef = {} as any;
    dialogRef.close = jasmine.createSpy('close');

    const dialog = injector.get(MatDialog);
    spyOn(dialog, 'open').and.returnValue(dialogRef);

    const subject1 = new Subject();
    service.showUntilExecuted(subject1).subscribe();
    const subject2 = new Subject();
    service.showUntilExecuted(subject2).subscribe();

    subject1.complete();
    expect(dialogRef.close).not.toHaveBeenCalled();

    subject2.complete();
    expect(dialogRef.close).toHaveBeenCalled();
  });
});
