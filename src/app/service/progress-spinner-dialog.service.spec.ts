import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {getTestBed, TestBed} from '@angular/core/testing';

import {TestSupport} from '../test/test-support';
import {ProgressSpinnerDialogService} from './progress-spinner-dialog.service';

describe('ProgressSpinnerDialogService', () => {
  let injector: TestBed;
  let service: ProgressSpinnerDialogService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: TestSupport.IMPORTS,
      declarations: TestSupport.DECLARATIONS,
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    });
    injector = getTestBed();
    service = injector.get(ProgressSpinnerDialogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
