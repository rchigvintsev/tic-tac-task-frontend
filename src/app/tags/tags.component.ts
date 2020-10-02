import {AfterViewChecked, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';

import {TranslateService} from '@ngx-translate/core';

import {Tag} from '../model/tag';
import {TagService} from '../service/tag.service';
import {AuthenticationService} from '../service/authentication.service';
import {LogService} from '../service/log.service';
import {WebServiceBasedComponent} from '../web-service-based.component';
import {ConfirmationDialogComponent} from '../confirmation-dialog/confirmation-dialog.component';
import {Strings} from '../util/strings';

@Component({
  selector: 'app-tags',
  templateUrl: './tags.component.html',
  styleUrls: ['./tags.component.styl']
})
export class TagsComponent extends WebServiceBasedComponent implements OnInit, AfterViewChecked {
  tags: Array<Tag>;
  tagFormModel: Tag;
  tagMenuOpened: boolean;
  tagNameInputFocused: boolean;

  @ViewChild('tagNameInput')
  private tagNameInput: ElementRef;
  private selectedTag: Tag;

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
  }

  ngAfterViewChecked(): void {
    if (this.tagFormModel && !this.tagNameInputFocused) {
      this.tagNameInput.nativeElement.focus();
      this.tagNameInputFocused = true;
      // It is required to prevent ExpressionChangedAfterItHasBeenCheckedError
      this.changeDetector.detectChanges();
    }
  }

  isTagSelected(tag: Tag) {
    return this.selectedTag && this.selectedTag.id === tag.id;
  }

  isTagBeingEdited(tag: Tag) {
    return this.tagFormModel && this.tagFormModel.id === tag.id;
  }

  onTagMenuTriggerButtonMouseDown(event) {
    event.stopPropagation(); // To prevent ripples on underlying list item
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

  private saveTag() {
    if (this.tagFormModel) {
      const tagIndex = this.tags.findIndex(t => t.id === this.tagFormModel.id);
      if (tagIndex < 0) {
        throw new Error(`Tag is not found by id ${this.tagFormModel.id}`);
      }

      const tag = this.tags[tagIndex];
      if (Strings.isBlank(this.tagFormModel.name)) {
        this.tagFormModel.name = tag.name;
      }

      if (!this.tagFormModel.equals(tag)) {
        this.tagService.updateTag(this.tagFormModel).subscribe(savedTag => {
          this.tagFormModel = null;
          this.tags[tagIndex] = savedTag;
        }, error => {
          this.tagFormModel = null;
          this.onServiceCallError(error);
        });
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
