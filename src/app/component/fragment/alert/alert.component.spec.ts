import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {AlertComponent} from './alert.component';
import {AlertService} from '../../../service/alert.service';
import {TestSupport} from '../../../test/test-support';

describe('AlertComponent', () => {
  let component: AlertComponent;
  let fixture: ComponentFixture<AlertComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: TestSupport.IMPORTS,
      declarations: TestSupport.DECLARATIONS,
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AlertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render info message', () => {
    const messageText = 'Info test';
    const alertService = fixture.debugElement.injector.get(AlertService);
    alertService.info(messageText);

    fixture.whenStable().then(() => {
      fixture.detectChanges();
      const compiled = fixture.debugElement.nativeElement;
      const alertElement = compiled.querySelector('.alert.alert-info');
      expect(alertElement).toBeTruthy();
      expect(alertElement.textContent.trim()).toEqual(messageText);
    });
  });

  it('should render warning message', () => {
    const messageText = 'Warning test';
    const alertService = fixture.debugElement.injector.get(AlertService);
    alertService.warn(messageText);

    fixture.whenStable().then(() => {
      fixture.detectChanges();
      const compiled = fixture.debugElement.nativeElement;
      const alertElement = compiled.querySelector('.alert.alert-warn');
      expect(alertElement).toBeTruthy();
      expect(alertElement.textContent.trim()).toEqual(messageText);
    });
  });

  it('should render error message', () => {
    const messageText = 'Error test';
    const alertService = fixture.debugElement.injector.get(AlertService);
    alertService.error(messageText);

    fixture.whenStable().then(() => {
      fixture.detectChanges();
      const compiled = fixture.debugElement.nativeElement;
      const alertElement = compiled.querySelector('.alert.alert-error');
      expect(alertElement).toBeTruthy();
      expect(alertElement.textContent.trim()).toEqual(messageText);
    });
  });
});
