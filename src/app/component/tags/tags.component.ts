import {AfterViewChecked, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {NavigationEnd, Router, RouterEvent} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';

import {TranslateService} from '@ngx-translate/core';
import {ColorEvent} from 'ngx-color';

import {Tag} from '../../model/tag';
import {TagService} from '../../service/tag.service';
import {AuthenticationService} from '../../service/authentication.service';
import {LogService} from '../../service/log.service';
import {WebServiceBasedComponent} from '../web-service-based.component';
import {ConfirmationDialogComponent} from '../confirmation-dialog/confirmation-dialog.component';
import {Strings} from '../../util/strings';
import {PathMatcher} from '../../util/path-matcher';

@Component({
  selector: 'app-tags',
  templateUrl: './tags.component.html',
  styleUrls: ['./tags.component.styl']
})
export class TagsComponent extends WebServiceBasedComponent implements OnInit, AfterViewChecked {
  readonly TAG_COLORS = [
    '#e57373', '#f06292', '#ba68c8', '#9575cd', '#7986cb',
    '#64b5f6', '#4dd0e1', '#4db6ac', '#81c784', '#dce775',
    '#fff176', '#ffb74d', '#a1887f', '#e0e0e0', '#90a4ae'
  ];

  tags: Tag[];
  tagFormModel: Tag;
  tagMenuOpened: boolean;
  tagNameInputFocused: boolean;

  @ViewChild('tagNameInput')
  private tagNameInput: ElementRef;
  private selectedTag: Tag;
  private pathMatcher: PathMatcher;

  constructor(router: Router,
              translate: TranslateService,
              authenticationService: AuthenticationService,
              log: LogService,
              private tagService: TagService,
              private dialog: MatDialog,
              private changeDetector: ChangeDetectorRef) {
    super(translate, router, authenticationService, log);
  }

  ngOnInit() {
    this.tagService.getTags().subscribe(tags => this.tags = tags, this.onServiceCallError.bind(this));
    this.tagService.getCreatedTag().subscribe(tag => this.tags.push(tag));
    this.pathMatcher = PathMatcher.fromUrlTree(this.router.parseUrl(this.router.url));
    this.router.events.subscribe((event: RouterEvent) => {
      if (event instanceof NavigationEnd) {
        this.onNavigationEnd(event);
      }
    });
  }

  ngAfterViewChecked(): void {
    if (this.tagFormModel && !this.tagNameInputFocused) {
      this.tagNameInput.nativeElement.focus();
      this.tagNameInputFocused = true;
      // It is required to prevent ExpressionChangedAfterItHasBeenCheckedError
      this.changeDetector.detectChanges();
    }
  }

  isTagSelected(tag: Tag): boolean {
    return this.selectedTag && this.selectedTag.id === tag.id;
  }

  isTagBeingEdited(tag: Tag): boolean {
    return this.tagFormModel && this.tagFormModel.id === tag.id;
  }

  isTagFormValid(): boolean {
    return this.tagFormModel && !Strings.isBlank(this.tagFormModel.name);
  }

  isRouterLinkActive(path: string): boolean {
    return this.pathMatcher && this.pathMatcher.matches(path);
  }

  onTagListItemMouseOver(tag: Tag) {
    this.selectedTag = tag;
  }

  onTagListItemMouseOut() {
    if (!this.tagMenuOpened) {
      this.selectedTag = null;
    }
  }

  onTagMenuOpened() {
    this.tagMenuOpened = true;
  }

  onTagMenuClosed() {
    this.tagMenuOpened = false;
    this.selectedTag = null;
  }

  onEditTagButtonClick(tag: Tag) {
    this.tagFormModel = tag.clone();
    this.tagNameInputFocused = false;
  }

  onDeleteTagButtonClick(tag: Tag) {
    const title = this.translate.instant('attention');
    const content = this.translate.instant('delete_tag_question');
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      restoreFocus: false,
      data: {title, content}
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteTag(tag);
      }
    });
  }

  onSaveTagButtonClick() {
    this.saveTag();
  }

  onCancelTagEditButtonClick() {
    this.tagFormModel = null;
  }

  onColorChangeComplete(e: ColorEvent): void {
    this.tagFormModel.color = e.color.hex;
  }

  private onNavigationEnd(e: NavigationEnd) {
    this.pathMatcher = PathMatcher.fromUrlTree(this.router.parseUrl(e.url));
  }

  private saveTag() {
    if (this.tagFormModel && !Strings.isBlank(this.tagFormModel.name)) {
      const tagIndex = this.tags.findIndex(t => t.id === this.tagFormModel.id);
      if (tagIndex < 0) {
        throw new Error(`Tag is not found by id ${this.tagFormModel.id}`);
      }
      const tag = this.tags[tagIndex];
      if (!this.tagFormModel.equals(tag)) {
        this.tagService.updateTag(this.tagFormModel).subscribe(savedTag => {
          this.tagFormModel = null;
          this.tags[tagIndex] = savedTag;
        }, this.onServiceCallError.bind(this));
      } else {
        this.tagFormModel = null;
      }
    }
  }

  private deleteTag(tag: Tag) {
    this.tagService.deleteTag(tag).subscribe(_ => this.tags = this.tags.filter(t => t.id !== tag.id),
      this.onServiceCallError.bind(this));
  }
}
