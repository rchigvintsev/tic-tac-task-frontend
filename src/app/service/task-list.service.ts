import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';

import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

import {ConfigService} from './config.service';
import {TaskList} from '../model/task-list';
import {Task} from '../model/task';
import {PageRequest} from './page-request';

const commonHttpOptions = {withCredentials: true};
const jsonContentOptions = Object.assign({
  headers: new HttpHeaders({'Content-Type': 'application/json'})
}, commonHttpOptions);

@Injectable({providedIn: 'root'})
export class TaskListService {
  readonly baseUrl: string;

  constructor(private http: HttpClient, private config: ConfigService) {
    this.baseUrl = `${this.config.apiBaseUrl}/task-lists`;
  }

  getUncompletedTaskLists(): Observable<TaskList[]> {
    return this.http.get<any>(`${this.baseUrl}/uncompleted`, commonHttpOptions).pipe(
      map(response => {
        const taskLists = [];
        for (const json of response) {
          taskLists.push(new TaskList().deserialize(json));
        }
        return taskLists;
      })
    );
  }

  getTaskList(id: number): Observable<TaskList> {
    return this.http.get<TaskList>(`${this.baseUrl}/${id}`, commonHttpOptions).pipe(
      map(response => new TaskList().deserialize(response))
    );
  }

  createTaskList(taskList: TaskList): Observable<TaskList> {
    return this.http.post<TaskList>(this.baseUrl, taskList.serialize(), jsonContentOptions).pipe(
      map(response => {
        return new TaskList().deserialize(response);
      })
    );
  }

  updateTaskList(taskList: TaskList): Observable<TaskList> {
    if (!taskList) {
      throw new Error('Task list must not be null or undefined');
    }
    return this.http.put<TaskList>(`${this.baseUrl}/${taskList.id}`, taskList.serialize(), jsonContentOptions).pipe(
      map(response => {
        return new TaskList().deserialize(response);
      })
    );
  }

  deleteTaskList(taskList: TaskList): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/${taskList.id}`, commonHttpOptions);
  }

  getTasks(taskListId: number, pageRequest: PageRequest = new PageRequest()): Observable<Task[]> {
    const url = `${this.baseUrl}/${taskListId}/tasks?${pageRequest.toQueryParameters()}`;
    return this.http.get<Task[]>(url, commonHttpOptions).pipe(
      map(response => {
        const tasks = [];
        for (const json of response) {
          tasks.push(new Task().deserialize(json));
        }
        return tasks;
      })
    );
  }
}
