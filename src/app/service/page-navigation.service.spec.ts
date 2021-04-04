import {TestBed} from '@angular/core/testing';

import {PageNavigationService} from './page-navigation.service';

describe('PageNavigationService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    const service: PageNavigationService = TestBed.get(PageNavigationService);
    expect(service).toBeTruthy();
  });
});
