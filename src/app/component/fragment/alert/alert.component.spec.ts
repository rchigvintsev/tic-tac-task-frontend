import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';

import {AlertComponent} from './alert.component';
import {AlertService} from '../../../service/alert.service';
import {TestSupport} from '../../../test/test-support';

describe('AlertComponent', () => {
  let component: AlertComponent;
  let fixture: ComponentFixture<AlertComponent>;

  beforeEach(waitForAsync(() => {
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

  it('should render info message', async () => {
    const messageText = 'Info test';
    const alertService = fixture.debugElement.injector.get(AlertService);
    alertService.info(messageText);

    await fixture.whenStable();

    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    const alertElement = compiled.querySelector('.alert.alert-info');
    expect(alertElement).toBeTruthy();
    expect(alertElement.textContent.trim()).toEqual(messageText);
  });

  it('should render warning message', async () => {
    const messageText = 'Warning test';
    const alertService = fixture.debugElement.injector.get(AlertService);
    alertService.warn(messageText);

    await fixture.whenStable();

    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    const alertElement = compiled.querySelector('.alert.alert-warn');
    expect(alertElement).toBeTruthy();
    expect(alertElement.textContent.trim()).toEqual(messageText);
  });

  it('should render error message', async () => {
    const messageText = 'Error test';
    const alertService = fixture.debugElement.injector.get(AlertService);
    alertService.error(messageText);

    await fixture.whenStable();

    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    const alertElement = compiled.querySelector('.alert.alert-error');
    expect(alertElement).toBeTruthy();
    expect(alertElement.textContent.trim()).toEqual(messageText);
  });
});
