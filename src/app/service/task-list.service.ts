import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';

import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

import {ConfigService} from './config.service';
import {TaskList} from '../model/task-list';

const commonHttpOptions = {withCredentials: true};

@Injectable({
  providedIn: 'root'
})
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

  deleteTaskList(taskList: TaskList): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/${taskList.id}`, commonHttpOptions);
  }
}
