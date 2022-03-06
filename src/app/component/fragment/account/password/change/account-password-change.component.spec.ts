import {ComponentFixture, TestBed} from '@angular/core/testing';
import {EventEmitter} from '@angular/core';

import {AccountPasswordChangeComponent, PasswordChangeEvent} from './account-password-change.component';
import {TestSupport} from '../../../../../test/test-support';

describe('AccountPasswordChangeComponent', () => {
  let component: AccountPasswordChangeComponent;
  let fixture: ComponentFixture<AccountPasswordChangeComponent>;
  let passwordChangeEventEmitter: EventEmitter<PasswordChangeEvent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: TestSupport.IMPORTS,
      declarations: TestSupport.DECLARATIONS
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountPasswordChangeComponent);

    component = fixture.componentInstance;

    passwordChangeEventEmitter = new EventEmitter();
    passwordChangeEventEmitter.emit = jasmine.createSpy('emit').and.stub();
    component.passwordChange = passwordChangeEventEmitter;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit "PasswordChangeEvent" on password change form submit', async () => {
    await fixture.whenStable();
    component.currentPassword = 'secret';
    component.newPasswordRepeated = component.newPassword = 'qwerty';
    TestSupport.setInputValue(fixture, 'current_password_input', component.currentPassword);
    TestSupport.setInputValue(fixture, 'new_password_input', component.newPassword);
    TestSupport.setInputValue(fixture, 'new_password_repeat_input', component.newPasswordRepeated);
    fixture.detectChanges();

    component.onPasswordChangeFormSubmit();
    expect(passwordChangeEventEmitter.emit).toHaveBeenCalled();
  });

  it('should not emit "PasswordChangeEvent" when current password is blank', async () => {
    await fixture.whenStable();
    component.currentPassword = ' ';
    component.newPasswordRepeated = component.newPassword = '12345';
    TestSupport.setInputValue(fixture, 'current_password_input', component.currentPassword);
    TestSupport.setInputValue(fixture, 'new_password_input', component.newPassword);
    TestSupport.setInputValue(fixture, 'new_password_repeat_input', component.newPasswordRepeated);
    fixture.detectChanges();

    component.onPasswordChangeFormSubmit();
    expect(passwordChangeEventEmitter.emit).not.toHaveBeenCalled();
  });

  it('should not emit "PasswordChangeEvent" when new passwords do not match', async () => {
    await fixture.whenStable();
    component.currentPassword = 'secret';
    component.newPassword = '12345';
    component.newPasswordRepeated = '54321';
    TestSupport.setInputValue(fixture, 'current_password_input', component.currentPassword);
    TestSupport.setInputValue(fixture, 'new_password_input', component.newPassword);
    TestSupport.setInputValue(fixture, 'new_password_repeat_input', component.newPasswordRepeated);
    fixture.detectChanges();

    component.onPasswordChangeFormSubmit();
    expect(passwordChangeEventEmitter.emit).not.toHaveBeenCalled();
  });

  it('should display error when current password is not valid', async () => {
    await fixture.whenStable();
    component.currentPasswordValid = false;
    fixture.detectChanges();

    const compiled = fixture.debugElement.nativeElement;
    const errorElement = compiled.querySelector('mat-error');
    expect(errorElement).toBeTruthy();
    expect(errorElement.textContent.trim()).toEqual('invalid_password');
  });
});
