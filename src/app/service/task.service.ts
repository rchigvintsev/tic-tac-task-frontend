import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';

import {BehaviorSubject, Observable} from 'rxjs';
import {map} from 'rxjs/operators';

import * as moment from 'moment';

import {Task} from '../model/task';
import {Tag} from '../model/tag';
import {TaskComment} from '../model/task-comment';
import {ConfigService} from './config.service';
import {TaskGroup} from '../model/task-group';
import {PageRequest} from './page-request';
import {HttpContentOptions} from '../util/http-content-options';
import {Assert} from '../util/assert';

@Injectable({providedIn: 'root'})
export class TaskService {
  readonly baseUrl: string;

  private readonly taskCounters = new Map<TaskGroup, BehaviorSubject<number>>();

  constructor(private http: HttpClient, private config: ConfigService) {
    this.baseUrl = `${this.config.apiBaseUrl}/tasks`;
    for (const taskGroup of TaskGroup.values()) {
      this.taskCounters.set(taskGroup, new BehaviorSubject<number>(null));
    }
  }

  private static getPathForTaskGroup(taskGroup: TaskGroup): string {
    if (taskGroup === TaskGroup.INBOX) {
      return 'unprocessed';
    }
    if (taskGroup === TaskGroup.ALL) {
      return 'uncompleted';
    }
    return 'processed';
  }

  private static getParametersForTaskGroup(taskGroup: TaskGroup): string {
    if (taskGroup === TaskGroup.TODAY) {
      const deadlineTo = moment().endOf('day').utc().format(moment.HTML5_FMT.DATETIME_LOCAL);
      return `deadlineTo=${deadlineTo}`;
    }

    if (taskGroup === TaskGroup.TOMORROW) {
      const deadlineFrom = moment().add(1, 'day').startOf('day').utc().format(moment.HTML5_FMT.DATETIME_LOCAL);
      const deadlineTo = moment().add(1, 'day').endOf('day').utc().format(moment.HTML5_FMT.DATETIME_LOCAL);
      return `deadlineFrom=${deadlineFrom}&deadlineTo=${deadlineTo}`;
    }

    if (taskGroup === TaskGroup.WEEK) {
      const deadlineTo = moment().add(1, 'week').endOf('day').utc().format(moment.HTML5_FMT.DATETIME_LOCAL);
      return `deadlineTo=${deadlineTo}`;
    }

    if (taskGroup === TaskGroup.SOME_DAY) {
      return 'deadlineFrom=&deadlineTo=';
    }

    return '';
  }

  hasTasks(taskGroup: TaskGroup): Observable<boolean> {
    return this.getTaskCount(taskGroup).pipe(map(count => count > 0));
  }

  getTaskCount(taskGroup: TaskGroup, forceLoad: boolean = false): Observable<number> {
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

  getTasksByGroup(taskGroup: TaskGroup, pageRequest: PageRequest = new PageRequest()): Observable<Task[]> {
    Assert.notNullOrUndefined(taskGroup, 'Task group must not be null or undefined');

    const path = TaskService.getPathForTaskGroup(taskGroup);
    let params = TaskService.getParametersForTaskGroup(taskGroup);
    if (params !== '') {
      params += '&';
    }
    params += pageRequest.toQueryParameters();

    const url = `${this.baseUrl}/${path}?${params}`;

    return this.http.get<any>(url, {withCredentials: true}).pipe(
      map(response => {
        const tasks = [];
        for (const json of response) {
          tasks.push(new Task().deserialize(json));
        }
        return tasks;
      })
    );
  }

  getTask(id: number): Observable<Task> {
    return this.http.get<Task>(`${this.baseUrl}/${id}`, {withCredentials: true}).pipe(
      map(response => new Task().deserialize(response))
    );
  }

  createTask(task: Task): Observable<Task> {
    Assert.notNullOrUndefined(task, 'Task must not be null or undefined');
    return this.http.post<any>(this.baseUrl, task.serialize(), HttpContentOptions.JSON).pipe(
      map(response => new Task().deserialize(response))
    );
  }

  updateTask(task: Task): Observable<Task> {
    Assert.notNullOrUndefined(task, 'Task must not be null or undefined');
    return this.http.put<any>(`${this.baseUrl}/${task.id}`, task.serialize(), HttpContentOptions.JSON).pipe(
      map(response => new Task().deserialize(response))
    );
  }

  completeTask(task: Task): Observable<any> {
    Assert.notNullOrUndefined(task, 'Task must not be null or undefined');
    return this.http.put<any>(`${this.baseUrl}/completed/${task.id}`, null, {withCredentials: true});
  }

  deleteTask(task: Task): Observable<any> {
    Assert.notNullOrUndefined(task, 'Task must not be null or undefined');
    return this.http.delete<any>(`${this.baseUrl}/${task.id}`, {withCredentials: true});
  }

  getTags(taskId: number): Observable<Tag[]> {
    return this.http.get<any>(`${this.baseUrl}/${taskId}/tags`, {withCredentials: true}).pipe(
      map(response => {
        const tags = [];
        for (const json of response) {
          tags.push(new Tag().deserialize(json));
        }
        return tags;
      })
    );
  }

  assignTag(taskId: number, tagId: number): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${taskId}/tags/${tagId}`, null, {withCredentials: true});
  }

  removeTag(taskId: number, tagId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${taskId}/tags/${tagId}`, {withCredentials: true});
  }

  getComments(taskId: number, pageRequest: PageRequest = new PageRequest()): Observable<TaskComment[]> {
    const url = `${this.baseUrl}/${taskId}/comments?${pageRequest.toQueryParameters()}`;
    return this.http.get<TaskComment[]>(url, {withCredentials: true}).pipe(
      map(response => {
        const comments = [];
        for (const json of response) {
          comments.push(new TaskComment().deserialize(json));
        }
        return comments;
      })
    );
  }

  addComment(taskId: number, comment: TaskComment): Observable<TaskComment> {
    Assert.notNullOrUndefined(comment, 'Task comment must not be null or undefined');
    const url = `${this.baseUrl}/${taskId}/comments`;
    return this.http.post<TaskComment>(url, comment.serialize(), HttpContentOptions.JSON).pipe(
      map(response => {
        return new TaskComment().deserialize(response);
      })
    );
  }

  private loadTaskCount(taskGroup: TaskGroup): Observable<number> {
    const path = TaskService.getPathForTaskGroup(taskGroup);
    let url = `${this.baseUrl}/${path}/count`;

    const params = TaskService.getParametersForTaskGroup(taskGroup);
    if (params !== '') {
      url += `?${params}`;
    }

    return this.http.get<number>(url, {withCredentials: true});
  }
}
