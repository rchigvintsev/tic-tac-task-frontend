import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';

import {Observable} from 'rxjs';
import {map, tap} from 'rxjs/operators';

import {TaskComment} from '../model/task-comment';
import {ConfigService} from './config.service';
import {I18nService} from './i18n.service';
import {LoadingIndicatorService} from './loading-indicator.service';
import {HttpContentOptions} from '../util/http-content-options';
import {HttpRequestError} from '../error/http-request.error';

@Injectable({providedIn: 'root'})
export class TaskCommentService {
  readonly baseUrl: string;

  constructor(private http: HttpClient,
              private config: ConfigService,
              private i18nService: I18nService,
              private loadingIndicatorService: LoadingIndicatorService) {
    this.baseUrl = `${this.config.apiBaseUrl}/v1/task-comments`;
  }

  updateComment(comment: TaskComment, showLoadingIndicator = true): Observable<TaskComment> {
    const url = `${this.baseUrl}/${comment.id}`;
    const observable = this.http.put<TaskComment>(url, comment.serialize(), HttpContentOptions.JSON).pipe(
      tap({
        error: (error: HttpRequestError) => {
          if (!error.localizedMessage) {
            error.localizedMessage = this.i18nService.translate('failed_to_save_task_comment');
          }
        }
      }),
      map(response => new TaskComment().deserialize(response))
    );
    return showLoadingIndicator ? this.loadingIndicatorService.showUntilExecuted(observable) : observable;
  }

  deleteComment(comment: TaskComment, showLoadingIndicator = true): Observable<any> {
    const observable = this.http.delete<any>(`${this.baseUrl}/${comment.id}`, {withCredentials: true}).pipe(
      tap({
        error: (error: HttpRequestError) => {
          if (!error.localizedMessage) {
            error.localizedMessage = this.i18nService.translate('failed_to_delete_task_comment');
          }
        }
      })
    );
    return showLoadingIndicator ? this.loadingIndicatorService.showUntilExecuted(observable) : observable;
  }
}
