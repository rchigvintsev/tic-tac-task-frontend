import {TestBed} from '@angular/core/testing';

import {TestSupport} from '../test/test-support';
import {PageNavigationService} from './page-navigation.service';

describe('PageNavigationService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: TestSupport.IMPORTS,
      declarations: TestSupport.DECLARATIONS
    });
  });

  it('should be created', () => {
    const service: PageNavigationService = TestBed.get(PageNavigationService);
    expect(service).toBeTruthy();
  });
});
