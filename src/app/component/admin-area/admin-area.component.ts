import {AfterViewInit, Component, Inject, OnInit, ViewChild} from '@angular/core';
import {MatPaginator, PageEvent} from '@angular/material/paginator';

import {flatMap} from 'rxjs/internal/operators';

import {I18nService} from '../../service/i18n.service';
import {UserService} from '../../service/user.service';
import {AuthenticationService} from '../../service/authentication.service';
import {User} from '../../model/user';
import {PageRequest} from '../../service/page-request';
import {HttpRequestError} from '../../error/http-request.error';
import {HTTP_RESPONSE_HANDLER, HttpResponseHandler} from '../../handler/http-response.handler';

@Component({
  selector: 'app-admin-area',
  templateUrl: './admin-area.component.html',
  styleUrls: ['./admin-area.component.scss']
})
export class AdminAreaComponent implements OnInit, AfterViewInit {
  authenticatedUser: User;
  userColumns: string[] = ['id', 'email', 'name', 'profilePicture', 'admin', 'blocked', 'actions'];
  userDataSource: User[] = [];
  totalNumberOfUsers = 0;

  @ViewChild('userPaginator')
  userPaginator: MatPaginator;

  private userCache: User[] = [];

  constructor(public i18nService: I18nService,
              private userService: UserService,
              private authenticationService: AuthenticationService,
              @Inject(HTTP_RESPONSE_HANDLER) protected httpResponseHandler: HttpResponseHandler) {
  }

  ngOnInit(): void {
    this.authenticatedUser = this.authenticationService.getAuthenticatedUser();
  }

  ngAfterViewInit() {
    this.userService.getUserCount().pipe(
      flatMap(totalNumberOfUser => {
        this.totalNumberOfUsers = totalNumberOfUser;
        return this.userService.getUsers(new PageRequest(0, this.userPaginator.pageSize));
      })
    ).subscribe(users => {
      this.userDataSource = users;
      this.userCache = users.slice();
    }, (error: HttpRequestError) => this.httpResponseHandler.handleError(error));

    this.userPaginator.page.subscribe(event => this.onUserPageChange(event));
  }

  onBlockUserButtonClick(user: User) {
    this.blockUser(user);
  }

  onUnblockUserButtonClick(user: User) {
    this.unblockUser(user);
  }

  private onUserPageChange(event: PageEvent) {
    const from = event.pageIndex * event.pageSize;
    let to = from + event.pageSize;
    if (to > this.totalNumberOfUsers) {
      to = this.totalNumberOfUsers;
    }

    if (from < this.userCache.length && to <= this.userCache.length) {
      this.userDataSource = this.userCache.slice(from, to);
    } else {
      this.userService.getUsers(new PageRequest(event.pageIndex, event.pageSize)).subscribe(users => {
        this.userDataSource = users;
        if (from >= this.userCache.length) {
          users.forEach(user => this.userCache.push(user));
        } else {
          for (let i = from, j = 0; j < users.length; i++, j++) {
            this.userCache[i] = users[j];
          }
        }
      });
    }
  }

  private blockUser(user: User) {
    const updatedUser = user.clone();
    updatedUser.enabled = false;
    this.userService.updateUser(updatedUser).subscribe(result => {
      user.enabled = result.enabled;
      this.httpResponseHandler.handleSuccess(this.i18nService.translate('user_blocked'));
    }, (error: HttpRequestError) => this.httpResponseHandler.handleError(error));
  }

  private unblockUser(user: User) {
    const updatedUser = user.clone();
    updatedUser.enabled = true;
    this.userService.updateUser(updatedUser).subscribe(result => {
      user.enabled = result.enabled;
      this.httpResponseHandler.handleSuccess(this.i18nService.translate('user_unblocked'));
    }, (error: HttpRequestError) => this.httpResponseHandler.handleError(error));
  }
}
