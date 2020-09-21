import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';

import {TranslateService} from '@ngx-translate/core';

import {Tag} from '../model/tag';
import {TagService} from '../service/tag.service';
import {AuthenticationService} from '../service/authentication.service';
import {LogService} from '../service/log.service';
import {WebServiceBasedComponent} from '../web-service-based.component';

@Component({
  selector: 'app-tags',
  templateUrl: './tags.component.html',
  styleUrls: ['./tags.component.styl']
})
export class TagsComponent extends WebServiceBasedComponent implements OnInit {
  tags: Array<Tag>;
  selectedTag: Tag;
  tagMenuOpened: boolean;

  constructor(router: Router,
              translate: TranslateService,
              authenticationService: AuthenticationService,
              log: LogService,
              private tagService: TagService) {
    super(translate, router, authenticationService, log);
  }

  ngOnInit() {
    this.tagService.getTags().subscribe(tags => this.tags = tags, this.onServiceCallError.bind(this));
  }

  onTagMenuTriggerButtonMouseDown(event) {
    event.stopPropagation(); // To prevent ripples on underlying list item
  }

  onTagListItemMouseOver(tag: Tag) {
    this.selectedTag = tag;
  }

  onTagListItemMouseOut(_: Tag) {
    if (!this.tagMenuOpened) {
      this.selectedTag = null;
    }
  }

  onTagMenuOpened(tag: Tag) {
    this.tagMenuOpened = true;
    this.selectedTag = tag;
  }

  onTagMenuClosed(_: Tag) {
    this.tagMenuOpened = false;
    this.selectedTag = null;
  }
}
