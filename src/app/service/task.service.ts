import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';

import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

import * as moment from 'moment';

import {Task} from '../model/task';
import {ConfigService} from './config.service';
import {TaskGroup} from './task-group';

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

  getTasks(taskGroup: TaskGroup) {
    let url;
    if (taskGroup === TaskGroup.INBOX) {
      url = `${this.baseUrl}/unprocessed`;
    } else if (taskGroup === TaskGroup.TODAY) {
      const deadlineFrom = moment().startOf('d').utc().format(moment.HTML5_FMT.DATETIME_LOCAL_MS);
      const deadlineTo = moment().endOf('d').utc().format(moment.HTML5_FMT.DATETIME_LOCAL_MS);
      url = `${this.baseUrl}/processed?deadlineFrom=${deadlineFrom}&deadlineTo=${deadlineTo}`;
    } else if (taskGroup === TaskGroup.TOMORROW) {
      const deadlineFrom = moment().add(1, 'd').startOf('day').utc().format(moment.HTML5_FMT.DATETIME_LOCAL_MS);
      const deadlineTo = moment().add(1, 'd').endOf('day').utc().format(moment.HTML5_FMT.DATETIME_LOCAL_MS);
      url = `${this.baseUrl}/processed?deadlineFrom=${deadlineFrom}&deadlineTo=${deadlineTo}`;
    } else if (taskGroup === TaskGroup.WEEK) {
      const deadlineFrom = moment().startOf('d').utc().format(moment.HTML5_FMT.DATETIME_LOCAL_MS);
      const deadlineTo = moment().add(1, 'w').endOf('day').utc().format(moment.HTML5_FMT.DATETIME_LOCAL_MS);
      url = `${this.baseUrl}/processed?deadlineFrom=${deadlineFrom}&deadlineTo=${deadlineTo}`;
    } else if (taskGroup === TaskGroup.SOME_DAY) {
      url = `${this.baseUrl}/processed?deadlineFrom=&deadlineTo=`;
    }

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
