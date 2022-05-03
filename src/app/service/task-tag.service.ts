import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';

import {Observable, Subject} from 'rxjs';
import {map, tap} from 'rxjs/operators';

import {ConfigService} from './config.service';
import {I18nService} from './i18n.service';
import {LoadingIndicatorService} from './loading-indicator.service';
import {TaskTag} from '../model/task-tag';
import {Task} from '../model/task';
import {PageRequest} from './page-request';
import {HttpRequestError} from '../error/http-request.error';
import {HttpRequestOptions} from '../util/http-request-options';
import {Assert} from '../util/assert';

@Injectable({providedIn: 'root'})
export class TaskTagService {
  readonly baseUrl: string;

  private readonly createdTagSource: Subject<TaskTag>;
  private readonly createdTag: Observable<TaskTag>;

  private readonly updatedTagSource: Subject<TaskTag>;
  private readonly updatedTag: Observable<TaskTag>;

  private readonly deletedTagSource: Subject<TaskTag>;
  private readonly deletedTag: Observable<TaskTag>;

  constructor(private http: HttpClient,
              private config: ConfigService,
              private i18nService: I18nService,
              private loadingIndicatorService: LoadingIndicatorService) {
    this.baseUrl = `${this.config.apiBaseUrl}/v1/tags`;

    this.createdTagSource = new Subject<TaskTag>();
    this.createdTag = this.createdTagSource.asObservable();

    this.updatedTagSource = new Subject<TaskTag>();
    this.updatedTag = this.updatedTagSource.asObservable();

    this.deletedTagSource = new Subject<TaskTag>();
    this.deletedTag = this.deletedTagSource.asObservable();
  }

  getTags(showLoadingIndicator = true): Observable<TaskTag[]> {
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
          tags.push(new TaskTag().deserialize(json));
        }
        return tags;
      })
    );
    return showLoadingIndicator ? this.loadingIndicatorService.showUntilExecuted(observable) : observable;
  }

  getTag(id: number, showLoadingIndicator = true): Observable<TaskTag> {
    const observable = this.http.get<any>(`${this.baseUrl}/${id}`, {withCredentials: true}).pipe(
      tap({
        error: (error: HttpRequestError) => {
          if (!error.localizedMessage) {
            error.localizedMessage = this.i18nService.translate('failed_to_load_tag');
          }
        }
      }),
      map(response => new TaskTag().deserialize(response))
    );
    return showLoadingIndicator ? this.loadingIndicatorService.showUntilExecuted(observable) : observable;
  }

  createTag(tag: TaskTag, showLoadingIndicator = true): Observable<TaskTag> {
    Assert.notNullOrUndefined(tag, 'Tag must not be null or undefined');
    const observable = this.http.post<TaskTag>(this.baseUrl, tag.serialize(), HttpRequestOptions.JSON).pipe(
      tap({
        error: (error: HttpRequestError) => {
          if (!error.localizedMessage) {
            error.localizedMessage = this.i18nService.translate('failed_to_save_tag');
          }
        }
      }),
      map(response => new TaskTag().deserialize(response)),
      tap(createdTag => this.notifyTagCreated(createdTag))
    );
    return showLoadingIndicator ? this.loadingIndicatorService.showUntilExecuted(observable) : observable;
  }

  updateTag(tag: TaskTag, showLoadingIndicator = true): Observable<TaskTag> {
    Assert.notNullOrUndefined(tag, 'Tag must not be null or undefined');
    const observable = this.http.put<TaskTag>(`${this.baseUrl}/${tag.id}`, tag.serialize(), HttpRequestOptions.JSON).pipe(
      tap({
        error: (error: HttpRequestError) => {
          if (!error.localizedMessage) {
            error.localizedMessage = this.i18nService.translate('failed_to_save_tag');
          }
        }
      }),
      map(response => new TaskTag().deserialize(response)),
      tap(updatedTag => this.notifyTagUpdated(updatedTag))
    );
    return showLoadingIndicator ? this.loadingIndicatorService.showUntilExecuted(observable) : observable;
  }

  deleteTag(tag: TaskTag, showLoadingIndicator = true): Observable<any> {
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
                      pageRequest: PageRequest = this.newPageRequest(),
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

  getCreatedTag(): Observable<TaskTag> {
    return this.createdTag;
  }

  getUpdatedTag(): Observable<TaskTag> {
    return this.updatedTag;
  }

  getDeletedTag(): Observable<TaskTag> {
    return this.deletedTag;
  }

  private notifyTagCreated(tag: TaskTag) {
    this.createdTagSource.next(tag);
  }

  private notifyTagUpdated(tag: TaskTag) {
    this.updatedTagSource.next(tag);
  }

  private notifyTagDeleted(tag: TaskTag) {
    this.deletedTagSource.next(tag);
  }

  private newPageRequest() {
    return new PageRequest(0, this.config.pageSize);
  }
}
