import {Component, Inject, OnInit, ViewChild} from '@angular/core';

import {tap} from 'rxjs/operators';

import {I18nService} from '../../service/i18n.service';
import {AuthenticationService} from '../../service/authentication.service';
import {UserService} from '../../service/user.service';
import {User} from '../../model/user';
import {HttpRequestError} from '../../error/http-request.error';
import {HTTP_RESPONSE_HANDLER, HttpResponseHandler} from '../../handler/http-response.handler';
import {Strings} from '../../util/strings';
import {ChangePasswordComponent, PasswordChangeEvent} from '../fragment/change-password/change-password.component';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss']
})
export class AccountComponent implements OnInit {
  userFormModel = new User();
  profilePictureFile: File;

  @ViewChild('changePasswordComponent')
  changePasswordComponent: ChangePasswordComponent;

  constructor(public i18nService: I18nService,
              private authenticationService: AuthenticationService,
              private userService: UserService,
              @Inject(HTTP_RESPONSE_HANDLER) protected httpResponseHandler: HttpResponseHandler) {
    const user = authenticationService.getAuthenticatedUser();
    this.userFormModel = user.clone();
  }

  ngOnInit(): void {
  }

  onFullNameInputBlur() {
    this.saveUser();
  }

  onProfilePictureFileChange(event) {
    this.profilePictureFile = event ? event.target.files[0] : null;
  }

  onProfilePictureFormSubmit() {
    this.saveProfilePicture();
  }

  onPasswordChange(event: PasswordChangeEvent) {
    this.changePassword(event.currentPassword, event.newPassword);
  }

  private saveUser() {
    const user = this.authenticationService.getAuthenticatedUser();
    if (Strings.isBlank(this.userFormModel.fullName)) {
      this.userFormModel.fullName = user.fullName;
    }

    if (this.userFormModel.fullName !== user.fullName) {
      this.userService.updateUser(this.userFormModel).pipe(
        tap({error: (error: HttpRequestError) => this.provideLocalizedErrorMessageIfEmpty(error)})
      ).subscribe(u => {
        this.userFormModel = u.clone();
        this.setAuthenticatedUser(u)
        this.httpResponseHandler.handleSuccess(this.i18nService.translate('account_settings_saved'));
      }, (error: HttpRequestError) => this.httpResponseHandler.handleError(error));
    }
  }

  private saveProfilePicture() {
    if (this.profilePictureFile) {
      const user = this.authenticationService.getAuthenticatedUser();
      this.userService.updateProfilePicture(user, this.profilePictureFile).pipe(
        tap({error: (error: HttpRequestError) => this.provideLocalizedErrorMessageIfEmpty(error)})
      ).subscribe(profilePictureUrl => {
        profilePictureUrl += '?' + Date.now();
        this.userFormModel.profilePictureUrl = user.profilePictureUrl = profilePictureUrl;
        this.setAuthenticatedUser(user)
        this.httpResponseHandler.handleSuccess(this.i18nService.translate('account_settings_saved'));
      }, (error: HttpRequestError) => this.httpResponseHandler.handleError(error));
    }
  }

  private changePassword(currentPassword: string, newPassword: string) {
    const user = this.authenticationService.getAuthenticatedUser();
    this.userService.changePassword(user, currentPassword, newPassword).subscribe(_ => {
      this.changePasswordComponent.reset();
      this.httpResponseHandler.handleSuccess(this.i18nService.translate('password_changed'));
    }, (error: HttpRequestError) => this.httpResponseHandler.handleError(error));
  }

  private provideLocalizedErrorMessageIfEmpty(error: HttpRequestError) {
    if (!error.localizedMessage) {
      error.localizedMessage = this.i18nService.translate('failed_to_save_account_settings');
    }
  }

  private setAuthenticatedUser(user: User) {
    const currentUser = this.authenticationService.getAuthenticatedUser();
    user.validUntilSeconds = currentUser.validUntilSeconds;
    this.authenticationService.setAuthenticatedUser(user);
  }
}
