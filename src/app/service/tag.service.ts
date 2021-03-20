import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';

import {Observable, Subject} from 'rxjs';
import {map, tap} from 'rxjs/operators';

import {ConfigService} from './config.service';
import {Tag} from '../model/tag';
import {Task} from '../model/task';
import {PageRequest} from './page-request';
import {HttpContentOptions} from '../util/http-content-options';

@Injectable({
  providedIn: 'root'
})
export class TagService {
  readonly baseUrl: string;

  private readonly createdTagSource: Subject<Tag>;
  private readonly createdTag: Observable<Tag>;

  private readonly updatedTagSource: Subject<Tag>;
  private readonly updatedTag: Observable<Tag>;

  private readonly deletedTagSource: Subject<Tag>;
  private readonly deletedTag: Observable<Tag>;

  constructor(private http: HttpClient, private config: ConfigService) {
    this.baseUrl = `${this.config.apiBaseUrl}/tags`;

    this.createdTagSource = new Subject<Tag>();
    this.createdTag = this.createdTagSource.asObservable();

    this.updatedTagSource = new Subject<Tag>();
    this.updatedTag = this.updatedTagSource.asObservable();

    this.deletedTagSource  = new Subject<Tag>();
    this.deletedTag = this.deletedTagSource.asObservable();
  }

  getTags(): Observable<Tag[]> {
    return this.http.get<any>(this.baseUrl, {withCredentials: true}).pipe(
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
    return this.http.get<any>(`${this.baseUrl}/${id}`, {withCredentials: true}).pipe(
      map(response => {
        return new Tag().deserialize(response);
      })
    );
  }

  createTag(tag: Tag): Observable<Tag> {
    if (!tag) {
      throw new Error('Tag must not be null or undefined');
    }
    return this.http.post<Tag>(this.baseUrl, tag.serialize(), HttpContentOptions.JSON).pipe(
      map(response => new Tag().deserialize(response)),
      tap(createdTag => this.notifyTagCreated(createdTag))
    );
  }

  updateTag(tag: Tag): Observable<Tag> {
    if (!tag) {
      throw new Error('Tag must not be null or undefined');
    }
    return this.http.put<Tag>(`${this.baseUrl}/${tag.id}`, tag.serialize(), HttpContentOptions.JSON).pipe(
      map(response => new Tag().deserialize(response)),
      tap(updatedTag => this.notifyTagUpdated(updatedTag))
    );
  }

  deleteTag(tag: Tag): Observable<any> {
    if (!tag) {
      throw new Error('Tag must not be null or undefined');
    }
    return this.http.delete<any>(`${this.baseUrl}/${tag.id}`, {withCredentials: true}).pipe(
      tap(_ => this.notifyTagDeleted(tag))
    );
  }

  getUncompletedTasks(tagId: number, pageRequest: PageRequest = new PageRequest()): Observable<Task[]> {
    const url = `${this.baseUrl}/${tagId}/tasks/uncompleted?${pageRequest.toQueryParameters()}`;
    return this.http.get<any>(url, {withCredentials: true}).pipe(
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

  getUpdatedTag(): Observable<Tag> {
    return this.updatedTag;
  }

  getDeletedTag(): Observable<Tag> {
    return this.deletedTag;
  }

  private notifyTagCreated(tag: Tag) {
    this.createdTagSource.next(tag);
  }

  private notifyTagUpdated(tag: Tag) {
    this.updatedTagSource.next(tag);
  }

  private notifyTagDeleted(tag: Tag) {
    this.deletedTagSource.next(tag);
  }
}
