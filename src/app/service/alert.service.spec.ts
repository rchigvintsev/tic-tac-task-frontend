import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {getTestBed, TestBed} from '@angular/core/testing';
import {NavigationStart, Router} from '@angular/router';

import {Subject} from 'rxjs';

import {AlertService} from './alert.service';
import {TestSupport} from '../test/test-support';

describe('AlertService', () => {
  let injector: TestBed;
  let service: AlertService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: TestSupport.IMPORTS,
      declarations: TestSupport.DECLARATIONS,
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [{provide: Router, useValue: {events: new Subject()}}]
    });
    injector = getTestBed();
    service = injector.get(AlertService);
  });


  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should clear message on navigation start', () => {
    service.info('Test message');

    const router = injector.get(Router);
    router.events.next(new NavigationStart(1, '/'));

    return service.getMessage().subscribe(message => expect(message).toBeNull());
  });
});
