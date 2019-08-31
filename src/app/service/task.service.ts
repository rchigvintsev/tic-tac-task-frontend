import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';

import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

import {Task} from '../model/task';

const httpOptions = {
  headers: new HttpHeaders({'Content-Type': 'application/json'})
};

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  // TODO: save base URL somewhere in the application settings
  taskUrl = '//localhost:8080/tasks';

  constructor(private http: HttpClient) {
  }

  getTasks(completed: boolean) {
    const options = {params: new HttpParams().set('completed', String(completed))};
    return this.http.get<any>(this.taskUrl, options).pipe(
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
    return this.http.get<any>(`${this.taskUrl}/${id}`).pipe(
      map(response => {
        return new Task().deserialize(response);
      })
    );
  }

  saveTask(task: Task): Observable<Task> {
    return this.http.post<Task>(this.taskUrl, task, httpOptions).pipe(
      map(response => {
        return new Task().deserialize(response);
      })
    );
  }
}
