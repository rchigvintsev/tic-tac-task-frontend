import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';

import {BehaviorSubject, Observable} from 'rxjs';
import {map} from 'rxjs/operators';

import * as moment from 'moment';

import {Task} from '../model/task';
import {Tag} from '../model/tag';
import {TaskComment} from '../model/task-comment';
import {ConfigService} from './config.service';
import {TaskGroup} from '../model/task-group';
import {PageRequest} from './page-request';

const commonHttpOptions = {withCredentials: true};
const jsonContentOptions = Object.assign({
  headers: new HttpHeaders({'Content-Type': 'application/json'})
}, commonHttpOptions);

@Injectable({
  providedIn: 'root'
})
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
    if (!taskGroup) {
      throw new Error('Task group must not be null or undefined');
    }
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
    if (!taskGroup) {
      throw new Error('Task group must not be null or undefined');
    }

    const path = TaskService.getPathForTaskGroup(taskGroup);

    let params = TaskService.getParametersForTaskGroup(taskGroup);
    if (params !== '') {
      params += '&';
    }
    params += pageRequest.toQueryParameters();

    const url = `${this.baseUrl}/${path}?${params}`;

    return this.http.get<any>(url, commonHttpOptions).pipe(
      map(response => {
        const tasks = [];
        for (const json of response) {
          tasks.push(new Task().deserialize(json));
        }
        return tasks;
      })
    );
  }

  getTasksByTag(tag: Tag, pageRequest: PageRequest = new PageRequest()): Observable<Task[]> {
    if (!tag) {
      throw new Error('Tag must not be null or undefined');
    }

    const params = `tagId=${tag.id}&${pageRequest.toQueryParameters()}`;
    const url = `${this.baseUrl}/uncompleted?${params}`;

    return this.http.get<any>(url, commonHttpOptions).pipe(
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
    return this.http.get<any>(`${this.baseUrl}/${id}`, commonHttpOptions).pipe(
      map(response => {
        return new Task().deserialize(response);
      })
    );
  }

  getComments(taskId: number, pageRequest: PageRequest = new PageRequest()): Observable<TaskComment[]> {
    const params = new HttpParams()
      .set('page', String(pageRequest.page))
      .set('size', String(pageRequest.size));
    const options = Object.assign({params}, commonHttpOptions);
    return this.http.get<any>(`${this.baseUrl}/${taskId}/comments`, options).pipe(
      map(response => {
        const comments = [];
        for (const json of response) {
          comments.push(new TaskComment().deserialize(json));
        }
        return comments;
      })
    );
  }

  createTask(task: Task): Observable<Task> {
    return this.http.post<Task>(this.baseUrl, task.serialize(), jsonContentOptions).pipe(
      map(response => {
        return new Task().deserialize(response);
      })
    );
  }

  updateTask(task: Task): Observable<Task> {
    return this.http.put<Task>(`${this.baseUrl}/${task.id}`, task.serialize(), jsonContentOptions).pipe(
      map(response => {
        return new Task().deserialize(response);
      })
    );
  }

  completeTask(task: Task): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/${task.id}/complete`, null, jsonContentOptions);
  }

  private loadTaskCount(taskGroup: TaskGroup): Observable<number> {
    const path = TaskService.getPathForTaskGroup(taskGroup);
    let url = `${this.baseUrl}/${path}/count`;

    const params = TaskService.getParametersForTaskGroup(taskGroup);
    if (params !== '') {
      url += `?${params}`;
    }

    return this.http.get<number>(url, commonHttpOptions);
  }
}
