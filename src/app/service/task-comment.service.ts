import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';

import {EMPTY, Observable} from 'rxjs';
import {map} from 'rxjs/operators';

import {TaskComment} from '../model/task-comment';

const appJsonOptions = {
  headers: new HttpHeaders({'Content-Type': 'application/json'})
};

@Injectable({
  providedIn: 'root'
})
export class TaskCommentService {
  // TODO: save base URL somewhere in the application settings
  taskCommentUrl = '//localhost:8080/taskComments';

  constructor(private http: HttpClient) {
  }

  getCommentsForTaskId(taskId: number): Observable<TaskComment[]> {
    const options = {params: new HttpParams().set('taskId', String(taskId))};
    return this.http.get<any>(this.taskCommentUrl, options).pipe(
      map(response => {
        const comments = [];
        for (const json of response) {
          comments.push(new TaskComment().deserialize(json));
        }
        return comments;
      })
    );
  }

  saveComment(comment: TaskComment): Observable<TaskComment> {
    return this.http.post<TaskComment>(this.taskCommentUrl, comment, appJsonOptions).pipe(
      map(response => {
        return new TaskComment().deserialize(response);
      })
    );
  }

  deleteComment(comment: TaskComment): Observable<any> {
    return this.http.delete<any>(`${this.taskCommentUrl}/${comment.id}`).pipe(map(() => EMPTY));
  }
}
