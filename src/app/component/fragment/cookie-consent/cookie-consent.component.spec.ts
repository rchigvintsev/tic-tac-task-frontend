import {ComponentFixture, getTestBed, TestBed} from '@angular/core/testing';

import {CookieConsentComponent} from './cookie-consent.component';
import {MatSnackBar, MatSnackBarRef} from '@angular/material/snack-bar';
import {CookieConsentContentComponent} from './content/cookie-consent-content.component';
import {Subject} from 'rxjs';
import {CookieService} from 'ngx-cookie-service';
import {TestSupport} from '../../../test/test-support';
import {ConfigService} from '../../../service/config.service';

describe('CookieConsentComponent', () => {
  let component: CookieConsentComponent;
  let fixture: ComponentFixture<CookieConsentComponent>;
  let snackBarRef: MatSnackBarRef<CookieConsentContentComponent>;
  let cookieService: CookieService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: TestSupport.IMPORTS,
      declarations: TestSupport.DECLARATIONS,
      providers: [{provide: ConfigService, useValue: {apiBaseUrl: 'https://backend.com'}}]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CookieConsentComponent);
    const injector = getTestBed();

    const snackBarOnAction = new Subject();

    const _snackBarRef = jasmine.createSpyObj(['onAction', 'dismissWithAction']);
    _snackBarRef.onAction.and.returnValue(snackBarOnAction);
    _snackBarRef.dismissWithAction.and.callFake(() => snackBarOnAction.next(true));
    snackBarRef = _snackBarRef;

    const snackBar = injector.inject(MatSnackBar);
    spyOn(snackBar, 'openFromComponent').and.returnValue(snackBarRef);

    cookieService = injector.inject(CookieService);
    spyOn(cookieService, 'set').and.stub();

    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set cookie indicating that user consented to use of cookies on banner dismiss', async () => {
    await fixture.whenStable();
    snackBarRef.dismissWithAction();
    // @ts-ignore
    expect(cookieService.set).toHaveBeenCalledOnceWith('cookie_consent_status', 'dismiss', jasmine.any(Date), '/', null);
  });
});
