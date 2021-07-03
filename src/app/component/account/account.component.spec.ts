import {ComponentFixture, getTestBed, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';

import {of} from 'rxjs';

import {AccountComponent} from './account.component';
import {TestSupport} from '../../test/test-support';
import {AuthenticationService} from '../../service/authentication.service';
import {ConfigService} from '../../service/config.service';
import {User} from '../../model/user';
import {HTTP_RESPONSE_HANDLER} from '../../handler/http-response.handler';
import {DefaultHttpResponseHandler} from '../../handler/default-http-response.handler';
import {UserService} from '../../service/user.service';

describe('AccountComponent', () => {
  let component: AccountComponent;
  let fixture: ComponentFixture<AccountComponent>;
  let authenticationService: AuthenticationService;
  let userService: UserService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: TestSupport.IMPORTS,
      declarations: TestSupport.DECLARATIONS,
      providers: [
        {provide: ConfigService, useValue: {apiBaseUrl: 'https://backend.com'}},
        {provide: HTTP_RESPONSE_HANDLER, useClass: DefaultHttpResponseHandler}
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    const injector = getTestBed();

    const user = new User();
    user.id = 1;
    user.email = 'john.doe@mail.com';
    user.fullName = 'John Doe';
    user.profilePictureUrl = 'https://example.com/avatar.png';
    user.validUntilSeconds = Math.round(Date.now() / 1000) + 60 * 60;

    authenticationService = injector.inject(AuthenticationService);
    spyOn(authenticationService, 'getAuthenticatedUser').and.returnValue(user);
    spyOn(authenticationService, 'setAuthenticatedUser').and.stub();

    userService = injector.inject(UserService);
    spyOn(userService, 'updateUser').and.callFake(u => of(u));

    fixture = TestBed.createComponent(AccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should save user on full name input blur', async () => {
    await fixture.whenStable();
    component.userFormModel.fullName = 'Doe John';
    component.onFullNameInputBlur();
    fixture.detectChanges();
    expect(userService.updateUser).toHaveBeenCalled();
  });

  it('should not save user with blank full name', async () => {
    await fixture.whenStable();
    component.userFormModel.fullName = ' ';
    component.onFullNameInputBlur();
    fixture.detectChanges();
    expect(userService.updateUser).not.toHaveBeenCalled();
  });

  it('should update authenticated user on user save', async () => {
    await fixture.whenStable();
    component.userFormModel.fullName = 'Doe John';
    component.onFullNameInputBlur();
    fixture.detectChanges();
    expect(authenticationService.setAuthenticatedUser).toHaveBeenCalled();
  });

  it('should update profile picture on profile picture form submit', async () => {
    const newProfilePictureUrl = 'https://backend.com/users/1/profile-picture';
    spyOn(userService, 'updateProfilePicture').and.callFake(() => of(newProfilePictureUrl));

    await fixture.whenStable();
    component.profilePictureFile = {} as File;
    component.onProfilePictureFormSubmit();
    fixture.detectChanges();
    expect(userService.updateProfilePicture).toHaveBeenCalled();
  });

  it('should not update profile picture on profile picture form submit when profile picture file is null', async () => {
    spyOn(userService, 'updateProfilePicture').and.stub();

    await fixture.whenStable();
    component.profilePictureFile = null;
    component.onProfilePictureFormSubmit();
    fixture.detectChanges();
    expect(userService.updateProfilePicture).not.toHaveBeenCalled();
  });

  it('should disable profile picture form submit button when profile picture file is null', async () => {
    await fixture.whenStable();
    component.profilePictureFile = null;
    fixture.detectChanges();
    const submitButton = fixture.debugElement.query(By.css('form.profile-picture-form button[type="submit"]'));
    expect(submitButton.nativeElement.disabled).toBeTruthy();
  });
});
