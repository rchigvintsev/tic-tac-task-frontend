import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {Component, ViewChild} from '@angular/core';
import {FormsModule, NgForm} from '@angular/forms';
import {By} from '@angular/platform-browser';

import {PasswordsMatchValidatorDirective} from './passwords-match.directive';

@Component({
  template: `
    <form #testForm="ngForm" passwordsMatch>
      <input name="password" type="password" ngModel>
      <input name="password-repeat" type="password" ngModel>
    </form>
  `
})
class TestComponent {
  @ViewChild('testForm')
  testForm: NgForm;
}

describe('PasswordsMatchValidatorDirective', () => {
  let fixture: ComponentFixture<TestComponent>;
  let component: TestComponent;

  beforeEach(waitForAsync(() => TestBed.configureTestingModule({
    imports: [FormsModule],
    declarations: [TestComponent, PasswordsMatchValidatorDirective]
  })));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    component = fixture.componentInstance;
  });

  it('should mark form as invalid when passwords do not match', async () => {
    const testForm = component.testForm;
    const passwordInput = fixture.debugElement.query(By.css('[name=password]'));
    const passwordRepeatInput = fixture.debugElement.query(By.css('[name=password-repeat]'));

    await fixture.whenStable();
    passwordInput.nativeElement.value = '12345';
    passwordInput.nativeElement.dispatchEvent(new Event('input'));

    passwordRepeatInput.nativeElement.value = '54321';
    passwordRepeatInput.nativeElement.dispatchEvent(new Event('input'));

    expect(testForm.control.valid).toBeFalsy();
    expect(testForm.control.hasError('passwordsMatch', ['password'])).toBeTruthy();
    expect(testForm.control.hasError('passwordsMatch', ['password-repeat'])).toBeTruthy();

    const passwordInputControl = testForm.control.get('password');
    expect(passwordInputControl.valid).toBeFalsy();
    expect(passwordInputControl.hasError('passwordsMatch')).toBeTruthy();

    const passwordRepeatInputControl = testForm.control.get('password-repeat');
    expect(passwordRepeatInputControl.valid).toBeFalsy();
    expect(passwordRepeatInputControl.hasError('passwordsMatch')).toBeTruthy();
  });
});
