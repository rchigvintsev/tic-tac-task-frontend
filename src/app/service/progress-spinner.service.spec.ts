import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {getTestBed, TestBed} from '@angular/core/testing';

import {TestSupport} from '../test/test-support';
import {ProgressSpinnerService} from './progress-spinner.service';

describe('ProgressSpinnerService', () => {
  let injector: TestBed;
  let service: ProgressSpinnerService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: TestSupport.IMPORTS,
      declarations: TestSupport.DECLARATIONS,
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    });
    injector = getTestBed();
    service = injector.get(ProgressSpinnerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
