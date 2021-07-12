import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {Component, ViewChild} from '@angular/core';
import {FormsModule, NgForm} from '@angular/forms';
import {By} from '@angular/platform-browser';

import {PasswordsMatchValidatorDirective} from './passwords-match.directive';

@Component({
  template: `
    <form #testForm="ngForm" passwordsMatch>
      <input name="newPassword" type="password" ngModel>
      <input name="newPasswordRepeat" type="password" ngModel>
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
    const newPasswordInput = fixture.debugElement.query(By.css('[name=newPassword]'));
    const newPasswordRepeatInput = fixture.debugElement.query(By.css('[name=newPasswordRepeat]'));

    await fixture.whenStable();
    newPasswordInput.nativeElement.value = '12345';
    newPasswordInput.nativeElement.dispatchEvent(new Event('input'));

    newPasswordRepeatInput.nativeElement.value = '54321';
    newPasswordRepeatInput.nativeElement.dispatchEvent(new Event('input'));

    expect(testForm.control.valid).toBeFalsy();
    expect(testForm.control.hasError('passwordsMatch', ['newPassword'])).toBeTruthy();
    expect(testForm.control.hasError('passwordsMatch', ['newPasswordRepeat'])).toBeTruthy();

    const passwordInputControl = testForm.control.get('newPassword');
    expect(passwordInputControl.valid).toBeFalsy();
    expect(passwordInputControl.hasError('passwordsMatch')).toBeTruthy();

    const passwordRepeatInputControl = testForm.control.get('newPasswordRepeat');
    expect(passwordRepeatInputControl.valid).toBeFalsy();
    expect(passwordRepeatInputControl.hasError('passwordsMatch')).toBeTruthy();
  });
});
