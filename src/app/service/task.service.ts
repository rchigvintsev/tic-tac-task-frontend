import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';

import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

import * as moment from 'moment';

import {Task} from '../model/task';
import {ConfigService} from './config.service';
import {TaskGroup} from './task-group';
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

  constructor(private http: HttpClient, private config: ConfigService) {
    this.baseUrl = `${this.config.apiBaseUrl}/tasks`;
  }

  getTasks(taskGroup: TaskGroup, pageRequest: PageRequest = new PageRequest()) {
    if (!taskGroup) {
      throw new Error('Task group must not be null or undefined');
    }

    let path;
    let params = '';

    if (taskGroup === TaskGroup.INBOX) {
      path = 'unprocessed';
    } else if (taskGroup === TaskGroup.TODAY) {
      const deadlineDateTo = moment().startOf('day').utc().format(moment.HTML5_FMT.DATE);
      path = 'processed';
      params = `deadlineDateTo=${deadlineDateTo}&`;
    } else if (taskGroup === TaskGroup.TOMORROW) {
      const deadlineDateFrom = moment().add(1, 'day').startOf('day').utc().format(moment.HTML5_FMT.DATE);
      const deadlineDateTo = moment().add(1, 'day').startOf('day').utc().format(moment.HTML5_FMT.DATE);
      path = 'processed';
      params = `deadlineDateFrom=${deadlineDateFrom}&deadlineDateTo=${deadlineDateTo}&`;
    } else if (taskGroup === TaskGroup.WEEK) {
      const deadlineDateTo = moment().add(1, 'week').startOf('day').utc().format(moment.HTML5_FMT.DATE);
      path = 'processed';
      params = `deadlineDateTo=${deadlineDateTo}&`;
    } else if (taskGroup === TaskGroup.SOME_DAY) {
      path = 'processed';
      params = 'deadlineDateFrom=&deadlineDateTo=&';
    } else if (taskGroup === TaskGroup.ALL) {
      path = 'uncompleted';
    } else {
      throw new Error(`Unsupported task group: ${taskGroup.value}`);
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

  getTask(id: number): Observable<Task> {
    return this.http.get<any>(`${this.baseUrl}/${id}`, commonHttpOptions).pipe(
      map(response => {
        return new Task().deserialize(response);
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
}
