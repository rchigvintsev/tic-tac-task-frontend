import {ComponentFixture, TestBed} from '@angular/core/testing';
import {EventEmitter} from '@angular/core';

import {ChangePasswordComponent, PasswordChangeEvent} from './change-password.component';
import {TestSupport} from '../../../test/test-support';

describe('ChangePasswordComponent', () => {
  let component: ChangePasswordComponent;
  let fixture: ComponentFixture<ChangePasswordComponent>;
  let passwordChangeEventEmitter: EventEmitter<PasswordChangeEvent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: TestSupport.IMPORTS,
      declarations: TestSupport.DECLARATIONS
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChangePasswordComponent);

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

    component.onChangePasswordFormSubmit();
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

    component.onChangePasswordFormSubmit();
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

    component.onChangePasswordFormSubmit();
    expect(passwordChangeEventEmitter.emit).not.toHaveBeenCalled();
  });
});
