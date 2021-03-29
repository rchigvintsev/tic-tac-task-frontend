import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';

import {Observable, Subject} from 'rxjs';
import {map, tap} from 'rxjs/operators';

import {ConfigService} from './config.service';
import {TaskList} from '../model/task-list';
import {Task} from '../model/task';
import {PageRequest} from './page-request';
import {HttpContentOptions} from '../util/http-content-options';
import {Assert} from '../util/assert';

@Injectable({providedIn: 'root'})
export class TaskListService {
  readonly baseUrl: string;

  private readonly createdTaskListSource: Subject<TaskList>;
  private readonly createdTaskList: Observable<TaskList>;

  private readonly updatedTaskListSource: Subject<TaskList>;
  private readonly updatedTaskList: Observable<TaskList>;

  private readonly completedTaskListSource: Subject<TaskList>;
  private readonly completedTaskList: Observable<TaskList>;

  private readonly deletedTaskListSource: Subject<TaskList>;
  private readonly deletedTaskList: Observable<TaskList>;

  constructor(private http: HttpClient, private config: ConfigService) {
    this.baseUrl = `${this.config.apiBaseUrl}/task-lists`;

    this.createdTaskListSource = new Subject<TaskList>();
    this.createdTaskList = this.createdTaskListSource.asObservable();

    this.updatedTaskListSource = new Subject<TaskList>();
    this.updatedTaskList = this.updatedTaskListSource.asObservable();

    this.completedTaskListSource = new Subject<TaskList>();
    this.completedTaskList = this.completedTaskListSource.asObservable();

    this.deletedTaskListSource  = new Subject<TaskList>();
    this.deletedTaskList = this.deletedTaskListSource.asObservable();
  }

  getUncompletedTaskLists(): Observable<TaskList[]> {
    return this.http.get<any>(`${this.baseUrl}/uncompleted`, {withCredentials: true}).pipe(
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
    return this.http.get<TaskList>(`${this.baseUrl}/${id}`, {withCredentials: true}).pipe(
      map(response => new TaskList().deserialize(response))
    );
  }

  createTaskList(taskList: TaskList): Observable<TaskList> {
    if (!taskList) {
      throw new Error('Task list must not be null or undefined');
    }
    return this.http.post<TaskList>(this.baseUrl, taskList.serialize(), HttpContentOptions.JSON).pipe(
      map(response => new TaskList().deserialize(response)),
      tap(createdTaskList => this.notifyTaskListCreated(createdTaskList))
    );
  }

  updateTaskList(taskList: TaskList): Observable<TaskList> {
    if (!taskList) {
      throw new Error('Task list must not be null or undefined');
    }
    const url = `${this.baseUrl}/${taskList.id}`;
    return this.http.put<TaskList>(url, taskList.serialize(), HttpContentOptions.JSON).pipe(
      map(response => new TaskList().deserialize(response)),
      tap(updatedTaskList => this.notifyTaskListUpdated(updatedTaskList))
    );
  }

  completeTaskList(taskList: TaskList): Observable<any> {
    if (!taskList) {
      throw new Error('Task list must not be null or undefined');
    }
    return this.http.put<any>(`${this.baseUrl}/completed/${taskList.id}`, null, {withCredentials: true}).pipe(
      tap(_ => {
        taskList.completed = true;
        this.notifyTaskListCompleted(taskList);
      })
    );
  }

  deleteTaskList(taskList: TaskList): Observable<any> {
    if (!taskList) {
      throw new Error('Task list must not be null or undefined');
    }
    return this.http.delete<any>(`${this.baseUrl}/${taskList.id}`, {withCredentials: true}).pipe(
      tap(_ => this.notifyTaskListDeleted(taskList))
    );
  }

  getTasks(taskListId: number, pageRequest: PageRequest = new PageRequest()): Observable<Task[]> {
    const url = `${this.baseUrl}/${taskListId}/tasks?${pageRequest.toQueryParameters()}`;
    return this.http.get<Task[]>(url, {withCredentials: true}).pipe(
      map(response => {
        const tasks = [];
        for (const json of response) {
          tasks.push(new Task().deserialize(json));
        }
        return tasks;
      })
    );
  }

  addTask(taskList: TaskList, task: Task): Observable<any> {
    Assert.notNullOrUndefined(taskList, 'Task list must not be null or undefined');
    Assert.notNullOrUndefined(task, 'Task must not be null or undefined');
    return this.http.put<any>(`${this.baseUrl}/${taskList.id}/tasks/${task.id}`, null, {withCredentials: true}).pipe(
      tap(_ => task.taskListId = taskList.id)
    );
  }

  getCreatedTaskList(): Observable<TaskList> {
    return this.createdTaskList;
  }

  getUpdatedTaskList(): Observable<TaskList> {
    return this.updatedTaskList;
  }

  getCompletedTaskList(): Observable<TaskList> {
    return this.completedTaskList;
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

  private notifyTaskListCompleted(taskList: TaskList) {
    this.completedTaskListSource.next(taskList);
  }

  private notifyTaskListDeleted(taskList: TaskList) {
    this.deletedTaskListSource.next(taskList);
  }
}
