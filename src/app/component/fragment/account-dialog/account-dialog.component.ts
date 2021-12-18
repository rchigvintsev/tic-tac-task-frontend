import {Component, Inject, Input, OnInit, ViewChild} from '@angular/core';

import {tap} from 'rxjs/operators';

import {I18nService} from '../../../service/i18n.service';
import {AuthenticationService} from '../../../service/authentication.service';
import {UserService} from '../../../service/user.service';
import {User} from '../../../model/user';
import {HttpRequestError} from '../../../error/http-request.error';
import {HTTP_RESPONSE_HANDLER, HttpResponseHandler} from '../../../handler/http-response.handler';
import {ChangePasswordComponent, PasswordChangeEvent} from '../change-password/change-password.component';
import {BadRequestError} from '../../../error/bad-request.error';
import {Strings} from '../../../util/strings';
import {MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'app-account-dialog',
  templateUrl: './account-dialog.component.html',
  styleUrls: ['./account-dialog.component.scss']
})
export class AccountDialogComponent implements OnInit {
  private static DEFAULT_PROFILE_PICTURE_FILE_MAX_SIZE = 1024 * 1024 * 3; // 3 Mb

  @Input()
  profilePictureFileMaxSize = AccountDialogComponent.DEFAULT_PROFILE_PICTURE_FILE_MAX_SIZE

  userFormModel = new User();
  profilePictureFile: File;

  @ViewChild('changePasswordComponent')
  changePasswordComponent: ChangePasswordComponent;

  constructor(public i18nService: I18nService,
              private authenticationService: AuthenticationService,
              private userService: UserService,
              @Inject(HTTP_RESPONSE_HANDLER) protected httpResponseHandler: HttpResponseHandler,
              private dialogRef: MatDialogRef<any>) {
    const user = authenticationService.getAuthenticatedUser();
    this.userFormModel = user.clone();
  }

  ngOnInit(): void {
  }

  onCloseButtonClick() {
    this.closeDialog();
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

  isValidProfilePictureFileSelected(): boolean {
    return this.profilePictureFile && this.validateProfilePictureFileSize(this.profilePictureFile);
  }

  get profilePictureFileMaxSizeInMegabytes(): number {
    return Math.round(this.profilePictureFileMaxSize / 1024 / 1000);
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
    if (this.isValidProfilePictureFileSelected()) {
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
    }, (error: HttpRequestError) => {
      if (error instanceof BadRequestError) {
        this.handleBadRequestError(error);
      }
      this.httpResponseHandler.handleError(error)
    });
  }

  private validateProfilePictureFileSize(profilePictureFile: File): boolean {
    return profilePictureFile.size <= this.profilePictureFileMaxSize;
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

  private handleBadRequestError(error: BadRequestError) {
    for (const fieldError of error.fieldErrors) {
      const fieldName = fieldError.field;
      if (fieldName === 'currentPassword') {
        this.changePasswordComponent.currentPasswordValid = false;
      }
    }
  }

  private closeDialog() {
    this.dialogRef.close();
  }
}
