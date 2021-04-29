import {Component, Inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {NavigationEnd, Router, RouterEvent} from '@angular/router';
import {NgForm} from '@angular/forms';

import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

import {I18nService} from '../../../service/i18n.service';
import {TagService} from '../../../service/tag.service';
import {Tag} from '../../../model/tag';
import {HttpRequestError} from '../../../error/http-request.error';
import {HTTP_RESPONSE_HANDLER, HttpResponseHandler} from '../../../handler/http-response.handler';
import {PathMatcher} from '../../../util/path-matcher';
import {Strings} from '../../../util/strings';

@Component({
  selector: 'app-tags',
  templateUrl: './tags.component.html',
  styleUrls: ['./tags.component.styl']
})
export class TagsComponent implements OnInit, OnDestroy {
  @ViewChild('tagForm')
  tagForm: NgForm;
  tagFormModel = new Tag();
  tagFormSubmitEnabled = false;
  tags: Tag[] = [];

  private pathMatcher: PathMatcher;
  private componentDestroyed = new Subject<boolean>();

  constructor(public i18nService: I18nService,
              @Inject(HTTP_RESPONSE_HANDLER) private httpResponseHandler: HttpResponseHandler,
              private tagService: TagService,
              private router: Router) {
  }

  ngOnInit() {
    this.tagService.getTags().subscribe(
      tags => this.tags = tags,
      (error: HttpRequestError) => this.httpResponseHandler.handleError(error)
    );
    this.tagService.getCreatedTag()
      .pipe(takeUntil(this.componentDestroyed))
      .subscribe(tag => this.onTagCreate(tag));
    this.tagService.getUpdatedTag()
      .pipe(takeUntil(this.componentDestroyed))
      .subscribe(tag => this.onTagUpdate(tag));
    this.tagService.getDeletedTag()
      .pipe(takeUntil(this.componentDestroyed))
      .subscribe(tag => this.onTagDelete(tag));

    this.pathMatcher = PathMatcher.fromUrlTree(this.router.parseUrl(this.router.url));

    this.router.events.subscribe((event: RouterEvent) => {
      if (event instanceof NavigationEnd) {
        this.onNavigationEnd(event);
      }
    });
  }

  ngOnDestroy(): void {
    this.componentDestroyed.next(true);
    this.componentDestroyed.complete();
  }

  isRouterLinkActive(path: string): boolean {
    return this.pathMatcher && this.pathMatcher.matches(path);
  }

  onTagFormModelChange() {
    this.tagFormSubmitEnabled = !Strings.isBlank(this.tagFormModel.name);
  }

  onTagFormSubmit() {
    this.createTag();
  }

  private onNavigationEnd(e: NavigationEnd) {
    this.pathMatcher = PathMatcher.fromUrlTree(this.router.parseUrl(e.url));
  }

  private createTag() {
    if (!Strings.isBlank(this.tagFormModel.name)) {
      this.tagService.createTag(this.tagFormModel).subscribe(
        _ => this.tagForm.resetForm(),
        (error: HttpRequestError) => this.httpResponseHandler.handleError(error)
      );
    }
  }

  private onTagCreate(tag: Tag) {
    return this.tags.push(tag);
  }

  private onTagUpdate(updatedTag: Tag) {
    const tagIndex = this.tags.findIndex(tag => tag.id === updatedTag.id);
    if (tagIndex >= 0) {
      this.tags[tagIndex] = updatedTag;
    }
  }

  private onTagDelete(deletedTag: Tag) {
    const tagIndex = this.tags.findIndex(tag => tag.id === deletedTag.id);
    if (tagIndex >= 0) {
      this.tags.splice(tagIndex, 1);
    }
  }
}
