import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {MatPaginator, PageEvent} from '@angular/material/paginator';

import {I18nService} from '../../service/i18n.service';
import {User} from '../../model/user';
import {UserService} from '../../service/user.service';
import {PageRequest} from '../../service/page-request';

@Component({
  selector: 'app-admin-area',
  templateUrl: './admin-area.component.html',
  styleUrls: ['./admin-area.component.scss']
})
export class AdminAreaComponent implements OnInit, AfterViewInit {
  userColumns: string[] = ['id', 'email', 'name', 'profilePicture', 'admin'];
  userDataSource: User[] = [];
  totalNumberOfUsers = 0;

  @ViewChild('userPaginator')
  userPaginator: MatPaginator;

  private userCache: User[] = [];

  constructor(public i18nService: I18nService, private userService: UserService) {
  }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    this.userService.getUserCount().subscribe(totalNumberOfUsers => {
      this.totalNumberOfUsers = totalNumberOfUsers;
      this.userService.getUsers(new PageRequest(0, this.userPaginator.pageSize)).subscribe(users => {
        this.userDataSource = users;
        this.userCache = users.slice();
      });
    });

    this.userPaginator.page.subscribe(event => this.onUserPageChange(event));
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
}
