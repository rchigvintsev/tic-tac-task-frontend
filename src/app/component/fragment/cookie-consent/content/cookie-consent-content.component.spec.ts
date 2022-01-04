import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CookieConsentContentComponent} from './cookie-consent-content.component';
import {TestSupport} from '../../../../test/test-support';
import {MatSnackBarRef} from '@angular/material/snack-bar';

describe('CookieConsentContentComponent', () => {
  let component: CookieConsentContentComponent;
  let fixture: ComponentFixture<CookieConsentContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: TestSupport.IMPORTS,
      declarations: [CookieConsentContentComponent],
      providers: [{provide: MatSnackBarRef, useValue: {dismissWithAction: () => {}}}]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CookieConsentContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
