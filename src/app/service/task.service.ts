import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';

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
  private taskUrl = '//localhost:8080/tasks';

  constructor(private http: HttpClient) {
  }

  getTasks(): Observable<Task[]> {
    return this.http.get<any>(this.taskUrl).pipe(
      map(response => {
        const tasks = [];
        for (let json of response._embedded.tasks)
          tasks.push(new Task().deserialize(json));
        return tasks;
      })
    );
  }

  createTask(task: Task): Observable<Task> {
    return this.http.post<Task>(this.taskUrl, task, httpOptions).pipe(
      map(response => {
        return new Task().deserialize(response);
      })
    );
  }
}
