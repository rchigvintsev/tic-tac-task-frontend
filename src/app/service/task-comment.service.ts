import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';

import {EMPTY, Observable} from 'rxjs';
import {map} from 'rxjs/operators';

import {TaskComment} from '../model/task-comment';
import {ConfigService} from './config.service';

const commonHttpOptions = {withCredentials: true};
const postOptions = Object.assign({headers: new HttpHeaders({'Content-Type': 'application/json'})}, commonHttpOptions);

@Injectable({
  providedIn: 'root'
})
export class TaskCommentService {
  readonly baseUrl: string;

  constructor(private http: HttpClient, private config: ConfigService) {
    this.baseUrl = `${this.config.apiBaseUrl}/task-comments`;
  }

  createComment(comment: TaskComment): Observable<TaskComment> {
    const options = Object.assign({params: new HttpParams().set('taskId', String(comment.taskId))}, postOptions);
    return this.http.post<TaskComment>(this.baseUrl, comment.serialize(), options).pipe(
      map(response => {
        return new TaskComment().deserialize(response);
      })
    );
  }

  updateComment(comment: TaskComment): Observable<TaskComment> {
    return this.http.put<TaskComment>(`${this.baseUrl}/${comment.id}`, comment.serialize(), postOptions).pipe(
      map(response => {
        return new TaskComment().deserialize(response);
      })
    );
  }

  deleteComment(comment: TaskComment): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/${comment.id}`, commonHttpOptions).pipe(map(() => EMPTY));
  }
}
