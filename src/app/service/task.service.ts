import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';

import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {map, tap} from 'rxjs/operators';

import * as moment from 'moment';

import {LoadingIndicatorService} from './loading-indicator.service';
import {Task} from '../model/task';
import {Tag} from '../model/tag';
import {TaskComment} from '../model/task-comment';
import {ConfigService} from './config.service';
import {I18nService} from './i18n.service';
import {TaskGroup} from '../model/task-group';
import {PageRequest} from './page-request';
import {HttpRequestError} from '../error/http-request.error';
import {HttpRequestOptions} from '../util/http-request-options';
import {Assert} from '../util/assert';
import {TaskStatus} from '../model/task-status';

@Injectable({providedIn: 'root'})
export class TaskService {
  readonly baseUrl: string;

  private readonly taskCounters = new Map<TaskGroup, BehaviorSubject<number>>();

  private readonly updatedTaskSource: Subject<Task>;
  private readonly updatedTask: Observable<Task>;

  private readonly restoredTaskSource: Subject<Task>;
  private readonly restoredTask: Observable<Task>;

  constructor(private http: HttpClient,
              private config: ConfigService,
              private i18nService: I18nService,
              private loadingIndicatorService: LoadingIndicatorService) {
    this.baseUrl = `${this.config.apiBaseUrl}/v1/tasks`;
    for (const taskGroup of TaskGroup.values()) {
      this.taskCounters.set(taskGroup, new BehaviorSubject<number>(null));
    }

    this.updatedTaskSource = new Subject<Task>();
    this.updatedTask = this.updatedTaskSource.asObservable();

    this.restoredTaskSource = new Subject<Task>();
    this.restoredTask = this.restoredTaskSource.asObservable();
  }

  private static getTaskStatusesForTaskGroup(taskGroup: TaskGroup): TaskStatus[] {
    if (taskGroup === TaskGroup.INBOX) {
      return [TaskStatus.UNPROCESSED];
    }
    if (taskGroup === TaskGroup.ALL) {
      return [TaskStatus.UNPROCESSED, TaskStatus.PROCESSED];
    }
    return [TaskStatus.PROCESSED];
  }

  private static getQueryString(taskGroup: TaskGroup, pageRequest: PageRequest = null): string {
    let queryString = '?statuses=';

    const statuses = TaskService.getTaskStatusesForTaskGroup(taskGroup);
    for (let i = 0; i < statuses.length; i++) {
      if (i > 0) {
        queryString += ',';
      }
      queryString += statuses[i];
    }

    switch (taskGroup) {
      case TaskGroup.TODAY: {
        const deadlineTo = moment().endOf('day').utc().format(moment.HTML5_FMT.DATETIME_LOCAL);
        queryString += `&deadlineTo=${deadlineTo}`;
        break;
      }
      case TaskGroup.TOMORROW: {
        const deadlineFrom = moment().add(1, 'day').startOf('day').utc().format(moment.HTML5_FMT.DATETIME_LOCAL);
        const deadlineTo = moment().add(1, 'day').endOf('day').utc().format(moment.HTML5_FMT.DATETIME_LOCAL);
        queryString += `&deadlineFrom=${deadlineFrom}&deadlineTo=${deadlineTo}`;
        break;
      }
      case TaskGroup.WEEK: {
        const deadlineTo = moment().add(1, 'week').endOf('day').utc().format(moment.HTML5_FMT.DATETIME_LOCAL);
        queryString += `&deadlineTo=${deadlineTo}`;
        break;
      }
      case TaskGroup.SOME_DAY: {
        queryString += '&deadlineFrom=&deadlineTo=';
        break;
      }
    }

    if (pageRequest) {
      queryString += `&${pageRequest.toQueryParameters()}`;
    }
    return queryString;
  }

  hasTasks(taskGroup: TaskGroup): Observable<boolean> {
    return this.getTaskCount(taskGroup).pipe(map(count => count > 0));
  }

  getTaskCount(taskGroup: TaskGroup, forceLoad = false): Observable<number> {
    Assert.notNullOrUndefined(taskGroup, 'Task group must not be null or undefined');

    const counter = this.taskCounters.get(taskGroup);
    const value = counter.getValue();
    if (value == null || forceLoad) {
      if (value == null) {
        counter.next(0);
      }

      this.loadTaskCount(taskGroup).subscribe(count => counter.next(count));
    }
    return counter;
  }

  updateTaskCounters() {
    this.taskCounters.forEach((counter, taskGroup) => {
      this.loadTaskCount(taskGroup).subscribe(count => counter.next(count));
    });
  }

  resetTaskCounters() {
    this.taskCounters.forEach(counter => counter.next(null));
  }

  getUpdatedTask(): Observable<Task> {
    return this.updatedTask;
  }

  getRestoredTask(): Observable<Task> {
    return this.restoredTask;
  }

  getTasks(taskGroup: TaskGroup, pageRequest: PageRequest = new PageRequest(), showLoadingIndicator = true): Observable<Task[]> {
    Assert.notNullOrUndefined(taskGroup, 'Task group must not be null or undefined');
    const url = this.baseUrl + TaskService.getQueryString(taskGroup, pageRequest);
    return this.loadTasks(url, showLoadingIndicator);
  }

  getArchivedTasks(pageRequest: PageRequest = new PageRequest(), showLoadingIndicator = true): Observable<Task[]> {
    const url = `${this.baseUrl}?statuses=COMPLETED&${pageRequest.toQueryParameters()}`;
    return this.loadTasks(url, showLoadingIndicator);
  }

  getTask(id: number, showLoadingIndicator = true): Observable<Task> {
    const observable = this.http.get<Task>(`${this.baseUrl}/${id}`, {withCredentials: true}).pipe(
      tap({
        error: (error: HttpRequestError) => {
          if (!error.localizedMessage) {
            error.localizedMessage = this.i18nService.translate('failed_to_load_task');
          }
        }
      }),
      map(response => new Task().deserialize(response))
    );
    return showLoadingIndicator ? this.loadingIndicatorService.showUntilExecuted(observable) : observable;
  }

  createTask(task: Task, showLoadingIndicator = true): Observable<Task> {
    Assert.notNullOrUndefined(task, 'Task must not be null or undefined');
    const observable = this.http.post<any>(this.baseUrl, task.serialize(), HttpRequestOptions.JSON).pipe(
      tap({
        error: (error: HttpRequestError) => {
          if (!error.localizedMessage) {
            error.localizedMessage = this.i18nService.translate('failed_to_save_task');
          }
        }
      }),
      map(response => new Task().deserialize(response))
    );
    return showLoadingIndicator ? this.loadingIndicatorService.showUntilExecuted(observable) : observable;
  }

  updateTask(task: Task, showLoadingIndicator = true): Observable<Task> {
    Assert.notNullOrUndefined(task, 'Task must not be null or undefined');
    const observable = this.http.put<any>(`${this.baseUrl}/${task.id}`, task.serialize(), HttpRequestOptions.JSON).pipe(
      tap({
        error: (error: HttpRequestError) => {
          if (!error.localizedMessage) {
            error.localizedMessage = this.i18nService.translate('failed_to_save_task');
          }
        }
      }),
      map(response => new Task().deserialize(response)),
      tap(updatedTask => this.notifyTaskUpdated(updatedTask))
    );
    return showLoadingIndicator ? this.loadingIndicatorService.showUntilExecuted(observable) : observable;
  }

  completeTask(task: Task, showLoadingIndicator = true): Observable<any> {
    Assert.notNullOrUndefined(task, 'Task must not be null or undefined');
    const observable = this.http.put<any>(`${this.baseUrl}/completed/${task.id}`, null, {withCredentials: true}).pipe(
      tap({
        error: (error: HttpRequestError) => {
          if (!error.localizedMessage) {
            error.localizedMessage = this.i18nService.translate('failed_to_complete_task');
          }
        }
      })
    );
    return showLoadingIndicator ? this.loadingIndicatorService.showUntilExecuted(observable) : observable;
  }

  restoreTask(task: Task, showLoadingIndicator = true): Observable<Task> {
    Assert.notNullOrUndefined(task, 'Task must not be null or undefined');
    const observable = this.http.delete<Task>(`${this.baseUrl}/completed/${task.id}`, {withCredentials: true}).pipe(
      tap({
        error: (error: HttpRequestError) => {
          if (!error.localizedMessage) {
            error.localizedMessage = this.i18nService.translate('failed_to_restore_task');
          }
        }
      }),
      map(response => new Task().deserialize(response)),
      tap(restoredTask => this.notifyTaskRestored(restoredTask))
    );
    return showLoadingIndicator ? this.loadingIndicatorService.showUntilExecuted(observable) : observable;
  }

  deleteTask(task: Task, showLoadingIndicator = true): Observable<any> {
    Assert.notNullOrUndefined(task, 'Task must not be null or undefined');
    const observable = this.http.delete<any>(`${this.baseUrl}/${task.id}`, {withCredentials: true}).pipe(
      tap({
        error: (error: HttpRequestError) => {
          if (!error.localizedMessage) {
            error.localizedMessage = this.i18nService.translate('failed_to_delete_task');
          }
        }
      }),
    );
    return showLoadingIndicator ? this.loadingIndicatorService.showUntilExecuted(observable) : observable;
  }

  getTags(taskId: number, showLoadingIndicator = true): Observable<Tag[]> {
    const observable = this.http.get<any>(`${this.baseUrl}/${taskId}/tags`, {withCredentials: true}).pipe(
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

  assignTag(taskId: number, tagId: number, showLoadingIndicator = true): Observable<void> {
    const url = `${this.baseUrl}/${taskId}/tags/${tagId}`;
    const observable = this.http.put<void>(url, null, {withCredentials: true}).pipe(
      tap({
        error: (error: HttpRequestError) => {
          if (!error.localizedMessage) {
            error.localizedMessage = this.i18nService.translate('failed_to_assign_tag');
          }
        }
      })
    );
    return showLoadingIndicator ? this.loadingIndicatorService.showUntilExecuted(observable) : observable;
  }

  removeTag(taskId: number, tagId: number, showLoadingIndicator = true): Observable<void> {
    const observable = this.http.delete<void>(`${this.baseUrl}/${taskId}/tags/${tagId}`, {withCredentials: true}).pipe(
      tap({
        error: (error: HttpRequestError) => {
          if (!error.localizedMessage) {
            error.localizedMessage = this.i18nService.translate('failed_to_remove_tag');
          }
        }
      })
    );
    return showLoadingIndicator ? this.loadingIndicatorService.showUntilExecuted(observable) : observable;
  }

  getComments(taskId: number,
              pageRequest: PageRequest = new PageRequest(),
              showLoadingIndicator = true): Observable<TaskComment[]> {
    const url = `${this.baseUrl}/${taskId}/comments?${pageRequest.toQueryParameters()}`;
    const observable = this.http.get<TaskComment[]>(url, {withCredentials: true}).pipe(
      tap({
        error: (error: HttpRequestError) => {
          if (!error.localizedMessage) {
            error.localizedMessage = this.i18nService.translate('failed_to_load_task_comments');
          }
        }
      }),
      map(response => {
        const comments = [];
        for (const json of response) {
          comments.push(new TaskComment().deserialize(json));
        }
        return comments;
      })
    );
    return showLoadingIndicator ? this.loadingIndicatorService.showUntilExecuted(observable) : observable;
  }

  addComment(taskId: number, comment: TaskComment, showLoadingIndicator = true): Observable<TaskComment> {
    Assert.notNullOrUndefined(comment, 'Task comment must not be null or undefined');
    const url = `${this.baseUrl}/${taskId}/comments`;
    const observable = this.http.post<TaskComment>(url, comment.serialize(), HttpRequestOptions.JSON).pipe(
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

  notifyTaskUpdated(task: Task) {
    this.updatedTaskSource.next(task);
  }

  notifyTaskRestored(task: Task) {
    this.restoredTaskSource.next(task);
  }

  private loadTaskCount(taskGroup: TaskGroup): Observable<number> {
    const url = `${this.baseUrl}/count${TaskService.getQueryString(taskGroup)}`;
    return this.http.get<number>(url, {withCredentials: true});
  }

  private loadTasks(url: string, showLoadingIndicator = true): Observable<Task[]> {
    const observable = this.http.get<Task[]>(url, {withCredentials: true}).pipe(
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
}
