import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';

import {EMPTY, Observable} from 'rxjs';
import {map} from 'rxjs/operators';

import {TaskComment} from '../model/task-comment';
import {ConfigService} from './config.service';
import {HttpContentOptions} from '../util/http-content-options';

@Injectable({
  providedIn: 'root'
})
export class TaskCommentService {
  readonly baseUrl: string;

  constructor(private http: HttpClient, private config: ConfigService) {
    this.baseUrl = `${this.config.apiBaseUrl}/task-comments`;
  }

  updateComment(comment: TaskComment): Observable<TaskComment> {
    const url = `${this.baseUrl}/${comment.id}`;
    return this.http.put<TaskComment>(url, comment.serialize(), HttpContentOptions.JSON).pipe(
      map(response => {
        return new TaskComment().deserialize(response);
      })
    );
  }

  deleteComment(comment: TaskComment): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/${comment.id}`, {withCredentials: true}).pipe(map(() => EMPTY));
  }
}
