import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';

import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

import {TaskComment} from '../model/task-comment';

@Injectable({
  providedIn: 'root'
})
export class TaskCommentService {
  // TODO: save base URL somewhere in the application settings
  private taskCommentUrl = '//localhost:8080/taskComments';

  constructor(private http: HttpClient) {
  }

  getCommentsForTaskId(taskId: number): Observable<TaskComment[]> {
    const options = {params: new HttpParams().set('taskId', String(taskId))};
    return this.http.get<any>(`${this.taskCommentUrl}/search/findByTaskId`, options).pipe(
      map(response => {
        const comments = [];
        for (const json of response._embedded.taskComments) {
          comments.push(new TaskComment().deserialize(json));
        }
        return comments;
      })
    );
  }
}
