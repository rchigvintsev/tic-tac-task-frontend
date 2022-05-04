import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';

import {Observable, Subject} from 'rxjs';
import {map, tap} from 'rxjs/operators';

import {ConfigService} from './config.service';
import {I18nService} from './i18n.service';
import {LoadingIndicatorService} from './loading-indicator.service';
import {TaskList} from '../model/task-list';
import {Task} from '../model/task';
import {PageRequest} from './page-request';
import {HttpRequestError} from '../error/http-request.error';
import {HttpRequestOptions} from '../util/http-request-options';
import {Assert} from '../util/assert';

@Injectable({providedIn: 'root'})
export class TaskListService {
  readonly baseUrl: string;

  private readonly createdTaskListSource: Subject<TaskList>;
  private readonly createdTaskList: Observable<TaskList>;

  private readonly updatedTaskListSource: Subject<TaskList>;
  private readonly updatedTaskList: Observable<TaskList>;

  private readonly completedTaskListSource: Subject<TaskList>;
  private readonly completedTaskList: Observable<TaskList>;

  private readonly deletedTaskListSource: Subject<TaskList>;
  private readonly deletedTaskList: Observable<TaskList>;

  constructor(private http: HttpClient,
              private config: ConfigService,
              private i18nService: I18nService,
              private loadingIndicatorService: LoadingIndicatorService) {
    this.baseUrl = `${this.config.apiBaseUrl}/v1/task-lists`;

    this.createdTaskListSource = new Subject<TaskList>();
    this.createdTaskList = this.createdTaskListSource.asObservable();

    this.updatedTaskListSource = new Subject<TaskList>();
    this.updatedTaskList = this.updatedTaskListSource.asObservable();

    this.completedTaskListSource = new Subject<TaskList>();
    this.completedTaskList = this.completedTaskListSource.asObservable();

    this.deletedTaskListSource = new Subject<TaskList>();
    this.deletedTaskList = this.deletedTaskListSource.asObservable();
  }

  getUncompletedTaskLists(showLoadingIndicator = true): Observable<TaskList[]> {
    const observable = this.http.get<any>(`${this.baseUrl}/uncompleted`, {withCredentials: true}).pipe(
      tap({
        error: (error: HttpRequestError) => {
          if (!error.localizedMessage) {
            error.localizedMessage = this.i18nService.translate('failed_to_load_task_lists');
          }
        }
      }),
      map(response => {
        const taskLists = [];
        for (const json of response) {
          taskLists.push(new TaskList().deserialize(json));
        }
        return taskLists;
      })
    );
    return showLoadingIndicator ? this.loadingIndicatorService.showUntilExecuted(observable) : observable;
  }

  getTaskList(id: number, showLoadingIndicator = true): Observable<TaskList> {
    const observable = this.http.get<TaskList>(`${this.baseUrl}/${id}`, {withCredentials: true}).pipe(
      tap({
        error: (error: HttpRequestError) => {
          if (!error.localizedMessage) {
            error.localizedMessage = this.i18nService.translate('failed_to_load_task_list');
          }
        }
      }),
      map(response => new TaskList().deserialize(response))
    );
    return showLoadingIndicator ? this.loadingIndicatorService.showUntilExecuted(observable) : observable;
  }

  createTaskList(taskList: TaskList, showLoadingIndicator = true): Observable<TaskList> {
    Assert.notNullOrUndefined(taskList, 'Task list must not be null or undefined');
    const observable = this.http.post<TaskList>(this.baseUrl, taskList.serialize(), HttpRequestOptions.JSON).pipe(
      tap({
        error: (error: HttpRequestError) => {
          if (!error.localizedMessage) {
            error.localizedMessage = this.i18nService.translate('failed_to_save_task_list');
          }
        }
      }),
      map(response => new TaskList().deserialize(response)),
      tap(createdTaskList => this.notifyTaskListCreated(createdTaskList))
    );
    return showLoadingIndicator ? this.loadingIndicatorService.showUntilExecuted(observable) : observable;
  }

  updateTaskList(taskList: TaskList, showLoadingIndicator = true): Observable<TaskList> {
    Assert.notNullOrUndefined(taskList, 'Task list must not be null or undefined');
    const url = `${this.baseUrl}/${taskList.id}`;
    const observable = this.http.put<TaskList>(url, taskList.serialize(), HttpRequestOptions.JSON).pipe(
      tap({
        error: (error: HttpRequestError) => {
          if (!error.localizedMessage) {
            error.localizedMessage = this.i18nService.translate('failed_to_save_task_list');
          }
        }
      }),
      map(response => new TaskList().deserialize(response)),
      tap(updatedTaskList => this.notifyTaskListUpdated(updatedTaskList))
    );
    return showLoadingIndicator ? this.loadingIndicatorService.showUntilExecuted(observable) : observable;
  }

  completeTaskList(taskList: TaskList, showLoadingIndicator = true): Observable<any> {
    Assert.notNullOrUndefined(taskList, 'Task list must not be null or undefined');
    const url = `${this.baseUrl}/completed/${taskList.id}`;
    const observable = this.http.put<any>(url, null, {withCredentials: true}).pipe(
      tap({
        next: _ => {
          taskList.completed = true;
          this.notifyTaskListCompleted(taskList);
        },
        error: (error: HttpRequestError) => {
          if (!error.localizedMessage) {
            error.localizedMessage = this.i18nService.translate('failed_to_complete_task_list');
          }
        }
      })
    );
    return showLoadingIndicator ? this.loadingIndicatorService.showUntilExecuted(observable) : observable;
  }

  deleteTaskList(taskList: TaskList, showLoadingIndicator = true): Observable<any> {
    Assert.notNullOrUndefined(taskList, 'Task list must not be null or undefined');
    const observable = this.http.delete<any>(`${this.baseUrl}/${taskList.id}`, {withCredentials: true}).pipe(
      tap({
        next: _ => this.notifyTaskListDeleted(taskList),
        error: (error: HttpRequestError) => {
          if (!error.localizedMessage) {
            error.localizedMessage = this.i18nService.translate('failed_to_delete_task');
          }
        }
      })
    );
    return showLoadingIndicator ? this.loadingIndicatorService.showUntilExecuted(observable) : observable;
  }

  getTasks(taskListId: number,
           pageRequest: PageRequest = this.newPageRequest(),
           showLoadingIndicator = true): Observable<Task[]> {
    const url = `${this.baseUrl}/${taskListId}/tasks?${pageRequest.toQueryParameters()}`;
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

  addTask(taskListId: number, taskId: number, showLoadingIndicator = true): Observable<any> {
    const url = `${this.baseUrl}/${taskListId}/tasks/${taskId}`;
    const observable = this.http.put<any>(url, null, {withCredentials: true}).pipe(
      tap({
        error: (error: HttpRequestError) => {
          if (!error.localizedMessage) {
            error.localizedMessage = this.i18nService.translate('failed_to_add_task_to_task_list');
          }
        }
      })
    );
    return showLoadingIndicator ? this.loadingIndicatorService.showUntilExecuted(observable) : observable;
  }

  removeTask(taskListId: number, taskId: number, showLoadingIndicator = true): Observable<any> {
    const url = `${this.baseUrl}/${taskListId}/tasks/${taskId}`;
    const observable = this.http.delete<any>(url, {withCredentials: true}).pipe(
      tap({
        error: (error: HttpRequestError) => {
          if (!error.localizedMessage) {
            error.localizedMessage = this.i18nService.translate('failed_to_remove_task_from_task_list');
          }
        }
      })
    );
    return showLoadingIndicator ? this.loadingIndicatorService.showUntilExecuted(observable) : observable;
  }

  getCreatedTaskList(): Observable<TaskList> {
    return this.createdTaskList;
  }

  getUpdatedTaskList(): Observable<TaskList> {
    return this.updatedTaskList;
  }

  getCompletedTaskList(): Observable<TaskList> {
    return this.completedTaskList;
  }

  getDeletedTaskList(): Observable<TaskList> {
    return this.deletedTaskList;
  }

  newPageRequest() {
    return new PageRequest(0, this.config.pageSize);
  }

  private notifyTaskListCreated(taskList: TaskList) {
    this.createdTaskListSource.next(taskList);
  }

  private notifyTaskListUpdated(taskList: TaskList) {
    this.updatedTaskListSource.next(taskList);
  }

  private notifyTaskListCompleted(taskList: TaskList) {
    this.completedTaskListSource.next(taskList);
  }

  private notifyTaskListDeleted(taskList: TaskList) {
    this.deletedTaskListSource.next(taskList);
  }
}
