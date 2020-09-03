import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';

import {TranslateService} from '@ngx-translate/core';

import {Tag} from '../model/tag';
import {TagService} from '../service/tag.service';
import {AuthenticationService} from '../service/authentication.service';
import {LogService} from '../service/log.service';
import {WebServiceBasedComponent} from '../web-service-based.component';
import {PageRequest} from '../service/page-request';

@Component({
  selector: 'app-tags',
  templateUrl: './tags.component.html',
  styleUrls: ['./tags.component.styl']
})
export class TagsComponent extends WebServiceBasedComponent implements OnInit {
  tags: Array<Tag>;

  private pageRequest = new PageRequest();

  constructor(router: Router,
              translate: TranslateService,
              authenticationService: AuthenticationService,
              log: LogService,
              private tagService: TagService) {
    super(translate, router, authenticationService, log);
  }

  ngOnInit() {
    this.tagService.getTags(this.pageRequest)
      .subscribe(tags => this.tags = tags, this.onServiceCallError.bind(this));
  }

  onTagListScroll() {
  }
}
