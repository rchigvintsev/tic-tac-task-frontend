import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';

import {EMPTY, Observable} from 'rxjs';
import {map} from 'rxjs/operators';

import {TaskComment} from '../model/task-comment';
import {ConfigService} from './config.service';

const commonHttpOptions = {withCredentials: true};

const appJsonHttpOptions = {
  headers: new HttpHeaders({'Content-Type': 'application/json'}),
  withCredentials: true
};

@Injectable({
  providedIn: 'root'
})
export class TaskCommentService {
  readonly baseUrl: string;

  constructor(private http: HttpClient, private config: ConfigService) {
    this.baseUrl = `${this.config.apiBaseUrl}/taskComments`;
  }

  getCommentsForTaskId(taskId: number): Observable<TaskComment[]> {
    const options = {params: new HttpParams().set('taskId', String(taskId)), withCredentials: true};
    return this.http.get<any>(this.baseUrl, options).pipe(
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
    return this.http.post<TaskComment>(this.baseUrl, comment, appJsonHttpOptions).pipe(
      map(response => {
        return new TaskComment().deserialize(response);
      })
    );
  }

  deleteComment(comment: TaskComment): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/${comment.id}`, commonHttpOptions).pipe(map(() => EMPTY));
  }
}
