import {ComponentFixture, TestBed} from '@angular/core/testing';

import {NotBlankValidatorDirective} from './not-blank.directive';
import {Component, ViewChild} from '@angular/core';
import {FormsModule, NgForm} from '@angular/forms';
import {By} from '@angular/platform-browser';

@Component({
  template: `
    <form #testForm="ngForm">
      <input name="testInput" type="text" ngModel notBlank>
    </form>
  `
})
class TestComponent {
  @ViewChild('testForm')
  testForm: NgForm;
}

describe('NotBlankValidatorDirective', () => {
  let fixture: ComponentFixture<TestComponent>;
  let component: TestComponent;

  beforeEach(() => TestBed.configureTestingModule({
    imports: [FormsModule],
    declarations: [TestComponent, NotBlankValidatorDirective]
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    component = fixture.componentInstance;
  });

  it('should mark form as invalid when input value is blank', () => {
    const testForm = component.testForm;
    const testInput = fixture.debugElement.query(By.css('[name=testInput]'));

    fixture.whenStable().then(() => {
      testInput.nativeElement.value = ' ';
      testInput.nativeElement.dispatchEvent(new Event('input'));

      expect(testForm.control.valid).toBeFalsy();
      expect(testForm.control.hasError('notBlank', ['testInput'])).toBeTruthy();

      const testInputControl = testForm.control.get('testInput');
      expect(testInputControl.valid).toBeFalsy();
      expect(testInputControl.hasError('notBlank')).toBeTruthy();
    });
  });
});
