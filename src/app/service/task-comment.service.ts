import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';

import {Observable} from 'rxjs';
import {map, mergeMap} from 'rxjs/operators';

import {TaskComment} from '../model/task-comment';

const httpOptions = {
  headers: new HttpHeaders({'Content-Type': 'application/json'})
};

@Injectable({
  providedIn: 'root'
})
export class TaskCommentService {
  // TODO: save base URL somewhere in the application settings
  private taskUrl = '//localhost:8080/tasks';
  private taskCommentUrl = '//localhost:8080/taskComments';

  constructor(private http: HttpClient) {
  }

  readonly createComment = (() => {
    const options = {headers: new HttpHeaders({'Content-Type': 'text/uri-list'})};
    return (comment: TaskComment, taskId: number): Observable<TaskComment> => {
      return this.saveComment(comment).pipe(
        mergeMap(response => {
          const savedComment = new TaskComment().deserialize(response);
          return this.http.put<TaskComment>(`${this.taskCommentUrl}/${savedComment.id}/task`,
            `${this.taskUrl}/${taskId}`, options).pipe(map(() => savedComment));
        })
      );
    };
  })();

  saveComment(comment: TaskComment): Observable<TaskComment> {
    return this.http.post<TaskComment>(this.taskCommentUrl, comment, httpOptions).pipe(
      map(response => {
        return new TaskComment().deserialize(response);
      })
    );
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
