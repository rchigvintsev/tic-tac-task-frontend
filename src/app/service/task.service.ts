import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';

import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

import {Task} from '../model/task';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  // TODO: save base URL somewhere in the application settings
  private tasksUrl = '//localhost:8080/tasks';

  constructor(private http: HttpClient) {
  }

  getTasks(): Observable<Task[]> {
    return this.http.get<any>(this.tasksUrl).pipe(
      map(response => {
        const tasks = [];
        for (let json of response._embedded.tasks)
          tasks.push(new Task().deserialize(json));
        return tasks;
      })
    );
  }
}
