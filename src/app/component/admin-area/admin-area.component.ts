import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {MatTableDataSource} from '@angular/material/table';
import {MatPaginator} from '@angular/material/paginator';

import {I18nService} from '../../service/i18n.service';
import {User} from '../../model/user';

@Component({
  selector: 'app-admin-area',
  templateUrl: './admin-area.component.html',
  styleUrls: ['./admin-area.component.scss']
})
export class AdminAreaComponent implements OnInit, AfterViewInit {
  userColumns: string[] = ['name'];
  userDataSource = new MatTableDataSource<User>();

  @ViewChild(MatPaginator)
  paginator: MatPaginator;

  constructor(public i18nService: I18nService) {
  }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    this.userDataSource.paginator = this.paginator;
  }
}
