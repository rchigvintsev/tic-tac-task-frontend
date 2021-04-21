import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';

import {Observable, Subject} from 'rxjs';
import {map, tap} from 'rxjs/operators';

import {ConfigService} from './config.service';
import {I18nService} from './i18n.service';
import {LoadingIndicatorService} from './loading-indicator.service';
import {Tag} from '../model/tag';
import {Task} from '../model/task';
import {PageRequest} from './page-request';
import {HttpRequestError} from '../error/http-request.error';
import {HttpContentOptions} from '../util/http-content-options';
import {Assert} from '../util/assert';

@Injectable({providedIn: 'root'})
export class TagService {
  readonly baseUrl: string;

  private readonly createdTagSource: Subject<Tag>;
  private readonly createdTag: Observable<Tag>;

  private readonly updatedTagSource: Subject<Tag>;
  private readonly updatedTag: Observable<Tag>;

  private readonly deletedTagSource: Subject<Tag>;
  private readonly deletedTag: Observable<Tag>;

  constructor(private http: HttpClient,
              private config: ConfigService,
              private i18nService: I18nService,
              private loadingIndicatorService: LoadingIndicatorService) {
    this.baseUrl = `${this.config.apiBaseUrl}/tags`;

    this.createdTagSource = new Subject<Tag>();
    this.createdTag = this.createdTagSource.asObservable();

    this.updatedTagSource = new Subject<Tag>();
    this.updatedTag = this.updatedTagSource.asObservable();

    this.deletedTagSource = new Subject<Tag>();
    this.deletedTag = this.deletedTagSource.asObservable();
  }

  getTags(showLoadingIndicator = true): Observable<Tag[]> {
    const observable = this.http.get<any>(this.baseUrl, {withCredentials: true}).pipe(
      tap({
        error: (error: HttpRequestError) => {
          if (!error.localizedMessage) {
            error.localizedMessage = this.i18nService.translate('failed_to_load_tags');
          }
        }
      }),
      map(response => {
        const tags = [];
        for (const json of response) {
          tags.push(new Tag().deserialize(json));
        }
        return tags;
      })
    );
    return showLoadingIndicator ? this.loadingIndicatorService.showUntilExecuted(observable) : observable;
  }

  getTag(id: number, showLoadingIndicator = true): Observable<Tag> {
    const observable = this.http.get<any>(`${this.baseUrl}/${id}`, {withCredentials: true}).pipe(
      tap({
        error: (error: HttpRequestError) => {
          if (!error.localizedMessage) {
            error.localizedMessage = this.i18nService.translate('failed_to_load_tag');
          }
        }
      }),
      map(response => new Tag().deserialize(response))
    );
    return showLoadingIndicator ? this.loadingIndicatorService.showUntilExecuted(observable) : observable;
  }

  createTag(tag: Tag, showLoadingIndicator = true): Observable<Tag> {
    Assert.notNullOrUndefined(tag, 'Tag must not be null or undefined');
    const observable = this.http.post<Tag>(this.baseUrl, tag.serialize(), HttpContentOptions.JSON).pipe(
      tap({
        error: (error: HttpRequestError) => {
          if (!error.localizedMessage) {
            error.localizedMessage = this.i18nService.translate('failed_to_save_tag');
          }
        }
      }),
      map(response => new Tag().deserialize(response)),
      tap(createdTag => this.notifyTagCreated(createdTag))
    );
    return showLoadingIndicator ? this.loadingIndicatorService.showUntilExecuted(observable) : observable;
  }

  updateTag(tag: Tag, showLoadingIndicator = true): Observable<Tag> {
    Assert.notNullOrUndefined(tag, 'Tag must not be null or undefined');
    const observable = this.http.put<Tag>(`${this.baseUrl}/${tag.id}`, tag.serialize(), HttpContentOptions.JSON).pipe(
      tap({
        error: (error: HttpRequestError) => {
          if (!error.localizedMessage) {
            error.localizedMessage = this.i18nService.translate('failed_to_save_tag');
          }
        }
      }),
      map(response => new Tag().deserialize(response)),
      tap(updatedTag => this.notifyTagUpdated(updatedTag))
    );
    return showLoadingIndicator ? this.loadingIndicatorService.showUntilExecuted(observable) : observable;
  }

  deleteTag(tag: Tag, showLoadingIndicator = true): Observable<any> {
    Assert.notNullOrUndefined(tag, 'Tag must not be null or undefined');
    const observable = this.http.delete<any>(`${this.baseUrl}/${tag.id}`, {withCredentials: true}).pipe(
      tap({
        next: _ => this.notifyTagDeleted(tag),
        error: (error: HttpRequestError) => {
          if (!error.localizedMessage) {
            error.localizedMessage = this.i18nService.translate('failed_to_delete_tag');
          }
        }
      })
    );
    return showLoadingIndicator ? this.loadingIndicatorService.showUntilExecuted(observable) : observable;
  }

  getUncompletedTasks(tagId: number,
                      pageRequest: PageRequest = new PageRequest(),
                      showLoadingIndicator = true): Observable<Task[]> {
    const url = `${this.baseUrl}/${tagId}/tasks/uncompleted?${pageRequest.toQueryParameters()}`;
    const observable = this.http.get<any>(url, {withCredentials: true}).pipe(
      tap({
        error: (error: HttpRequestError) => {
          if (!error.localizedMessage) {
            error.localizedMessage = this.i18nService.translate('failed_to_load_tasks');
          }
        }
      }),
      map(response => {
        const tasks = [];
        for (const json of response) {
          tasks.push(new Task().deserialize(json));
        }
        return tasks;
      })
    );
    return showLoadingIndicator ? this.loadingIndicatorService.showUntilExecuted(observable) : observable;
  }

  getCreatedTag(): Observable<Tag> {
    return this.createdTag;
  }

  getUpdatedTag(): Observable<Tag> {
    return this.updatedTag;
  }

  getDeletedTag(): Observable<Tag> {
    return this.deletedTag;
  }

  private notifyTagCreated(tag: Tag) {
    this.createdTagSource.next(tag);
  }

  private notifyTagUpdated(tag: Tag) {
    this.updatedTagSource.next(tag);
  }

  private notifyTagDeleted(tag: Tag) {
    this.deletedTagSource.next(tag);
  }
}
