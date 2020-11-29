import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';

import {Observable, Subject} from 'rxjs';
import {map, tap} from 'rxjs/operators';

import {ConfigService} from './config.service';
import {Tag} from '../model/tag';
import {Task} from '../model/task';
import {PageRequest} from './page-request';

const commonHttpOptions = {withCredentials: true};
const jsonContentOptions = Object.assign({
  headers: new HttpHeaders({'Content-Type': 'application/json'})
}, commonHttpOptions);

@Injectable({
  providedIn: 'root'
})
export class TagService {
  readonly baseUrl: string;

  private readonly createdTagSource: Subject<Tag>;
  private readonly createdTag: Observable<Tag>;

  private readonly deletedTagSource: Subject<Tag>;
  private readonly deletedTag: Observable<Tag>;

  constructor(private http: HttpClient, private config: ConfigService) {
    this.baseUrl = `${this.config.apiBaseUrl}/tags`;

    this.createdTagSource = new Subject<Tag>();
    this.createdTag = this.createdTagSource.asObservable();

    this.deletedTagSource  = new Subject<Tag>();
    this.deletedTag = this.deletedTagSource.asObservable();
  }

  getTags(): Observable<Tag[]> {
    return this.http.get<any>(this.baseUrl, commonHttpOptions).pipe(
      map(response => {
        const tags = [];
        for (const json of response) {
          tags.push(new Tag().deserialize(json));
        }
        return tags;
      })
    );
  }

  getTag(id: number): Observable<Tag> {
    return this.http.get<any>(`${this.baseUrl}/${id}`, commonHttpOptions).pipe(
      map(response => {
        return new Tag().deserialize(response);
      })
    );
  }

  createTag(tag: Tag): Observable<Tag> {
    if (!tag) {
      throw new Error('Tag must not be null or undefined');
    }
    return this.http.post<Tag>(this.baseUrl, tag.serialize(), jsonContentOptions).pipe(
      tap(_ => this.notifyTagCreated(tag)),
      map(response => {
        return new Tag().deserialize(response);
      })
    );
  }

  updateTag(tag: Tag): Observable<Tag> {
    if (!tag) {
      throw new Error('Tag must not be null or undefined');
    }
    return this.http.put<Tag>(`${this.baseUrl}/${tag.id}`, tag.serialize(), jsonContentOptions).pipe(
      map(response => {
        return new Tag().deserialize(response);
      })
    );
  }

  deleteTag(tag: Tag): Observable<any> {
    if (!tag) {
      throw new Error('Tag must not be null or undefined');
    }
    return this.http.delete<any>(`${this.baseUrl}/${tag.id}`, commonHttpOptions).pipe(
      tap(_ => this.notifyTagDeleted(tag))
    );
  }

  getUncompletedTasks(tagId: number, pageRequest: PageRequest = new PageRequest()): Observable<Task[]> {
    const url = `${this.baseUrl}/${tagId}/tasks/uncompleted?${pageRequest.toQueryParameters()}`;
    return this.http.get<any>(url, commonHttpOptions).pipe(
      map(response => {
        const tasks = [];
        for (const json of response) {
          tasks.push(new Task().deserialize(json));
        }
        return tasks;
      })
    );
  }

  getCreatedTag(): Observable<Tag> {
    return this.createdTag;
  }

  getDeletedTag(): Observable<Tag> {
    return this.deletedTag;
  }

  private notifyTagCreated(tag: Tag) {
    this.createdTagSource.next(tag);
  }

  private notifyTagDeleted(tag: Tag) {
    this.deletedTagSource.next(tag);
  }
}
