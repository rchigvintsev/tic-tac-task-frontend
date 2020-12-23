import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';

import {Observable, Subject} from 'rxjs';
import {map, tap} from 'rxjs/operators';

import {ConfigService} from './config.service';
import {TaskList} from '../model/task-list';
import {Task} from '../model/task';
import {PageRequest} from './page-request';

const commonHttpOptions = {withCredentials: true};
const jsonContentOptions = Object.assign({
  headers: new HttpHeaders({'Content-Type': 'application/json'})
}, commonHttpOptions);

@Injectable({providedIn: 'root'})
export class TaskListService {
  readonly baseUrl: string;

  private readonly createdTaskListSource: Subject<TaskList>;
  private readonly createdTaskList: Observable<TaskList>;

  private readonly updatedTaskListSource: Subject<TaskList>;
  private readonly updatedTaskList: Observable<TaskList>;

  private readonly deletedTaskListSource: Subject<TaskList>;
  private readonly deletedTaskList: Observable<TaskList>;

  constructor(private http: HttpClient, private config: ConfigService) {
    this.baseUrl = `${this.config.apiBaseUrl}/task-lists`;

    this.createdTaskListSource = new Subject<TaskList>();
    this.createdTaskList = this.createdTaskListSource.asObservable();

    this.updatedTaskListSource = new Subject<TaskList>();
    this.updatedTaskList = this.updatedTaskListSource.asObservable();

    this.deletedTaskListSource  = new Subject<TaskList>();
    this.deletedTaskList = this.deletedTaskListSource.asObservable();
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

  getTaskList(id: number): Observable<TaskList> {
    return this.http.get<TaskList>(`${this.baseUrl}/${id}`, commonHttpOptions).pipe(
      map(response => new TaskList().deserialize(response))
    );
  }

  createTaskList(taskList: TaskList): Observable<TaskList> {
    if (!taskList) {
      throw new Error('Task list must not be null or undefined');
    }
    return this.http.post<TaskList>(this.baseUrl, taskList.serialize(), jsonContentOptions).pipe(
      map(response => new TaskList().deserialize(response)),
      tap(createdTaskList => this.notifyTaskListCreated(createdTaskList))
    );
  }

  updateTaskList(taskList: TaskList): Observable<TaskList> {
    if (!taskList) {
      throw new Error('Task list must not be null or undefined');
    }
    return this.http.put<TaskList>(`${this.baseUrl}/${taskList.id}`, taskList.serialize(), jsonContentOptions).pipe(
      map(response => new TaskList().deserialize(response)),
      tap(updatedTaskList => this.notifyTaskListUpdated(updatedTaskList))
    );
  }

  deleteTaskList(taskList: TaskList): Observable<any> {
    if (!taskList) {
      throw new Error('Task list must not be null or undefined');
    }
    return this.http.delete<any>(`${this.baseUrl}/${taskList.id}`, commonHttpOptions).pipe(
      tap(_ => this.notifyTaskListDeleted(taskList))
    );
  }

  getTasks(taskListId: number, pageRequest: PageRequest = new PageRequest()): Observable<Task[]> {
    const url = `${this.baseUrl}/${taskListId}/tasks?${pageRequest.toQueryParameters()}`;
    return this.http.get<Task[]>(url, commonHttpOptions).pipe(
      map(response => {
        const tasks = [];
        for (const json of response) {
          tasks.push(new Task().deserialize(json));
        }
        return tasks;
      })
    );
  }

  getCreatedTaskList(): Observable<TaskList> {
    return this.createdTaskList;
  }

  getUpdatedTaskList(): Observable<TaskList> {
    return this.updatedTaskList;
  }

  getDeletedTaskList(): Observable<TaskList> {
    return this.deletedTaskList;
  }

  private notifyTaskListCreated(taskList: TaskList) {
    this.createdTaskListSource.next(taskList);
  }

  private notifyTaskListUpdated(taskList: TaskList) {
    this.updatedTaskListSource.next(taskList);
  }

  private notifyTaskListDeleted(taskList: TaskList) {
    this.deletedTaskListSource.next(taskList);
  }
}
