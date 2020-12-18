import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {NgForm} from '@angular/forms';
import {MatDialog} from '@angular/material/dialog';

import {flatMap, map} from 'rxjs/operators';

import {TranslateService} from '@ngx-translate/core';

import {WebServiceBasedComponent} from '../web-service-based.component';
import {ConfirmationDialogComponent} from '../fragment/confirmation-dialog/confirmation-dialog.component';
import {AuthenticationService} from '../../service/authentication.service';
import {LogService} from '../../service/log.service';
import {TaskService} from '../../service/task.service';
import {TaskListService} from '../../service/task-list.service';
import {PageRequest} from '../../service/page-request';
import {Task} from '../../model/task';
import {TaskList} from '../../model/task-list';
import {TaskStatus} from '../../model/task-status';
import {TaskGroup} from '../../model/task-group';
import {Strings} from '../../util/strings';

@Component({
  selector: 'app-task-list-tasks',
  templateUrl: './task-list-tasks.component.html',
  styleUrls: ['./task-list-tasks.component.styl']
})
export class TaskListTasksComponent extends WebServiceBasedComponent implements OnInit {
  titleEditing = false;
  taskListFormModel = new TaskList();
  taskFormModel = new Task();
  tasks: Task[];

  @ViewChild('title')
  titleElement: ElementRef;
  @ViewChild('taskForm')
  taskForm: NgForm;

  private taskList: TaskList;
  private pageRequest = new PageRequest();

  constructor(translate: TranslateService,
              router: Router,
              authenticationService: AuthenticationService,
              log: LogService,
              private route: ActivatedRoute,
              private taskService: TaskService,
              private taskListService: TaskListService,
              private dialog: MatDialog) {
    super(translate, router, authenticationService, log);
  }

  ngOnInit() {
    this.route.params.pipe(
      map(params => +params.id),
      flatMap(id => this.taskListService.getTaskList(id)),
      flatMap(taskList => {
        this.setTaskListModel(taskList);
        return this.taskListService.getTasks(taskList.id);
      })
    ).subscribe(tasks => this.onTasksLoad(tasks), this.onServiceCallError.bind(this));

  }

  onTitleTextClick() {
    this.beginTitleEditing();
  }

  onTitleInputBlur() {
    this.endTitleEditing();
  }

  onTitleInputEnterKeydown() {
    if (!Strings.isBlank(this.taskListFormModel.name)) {
      this.endTitleEditing();
    }
  }

  onTitleInputEscapeKeydown() {
    this.taskListFormModel.name = this.taskList.name;
    this.endTitleEditing();
  }

  onTaskFormSubmit() {
    this.createTask();
  }

  onTaskListScroll() {
    if (this.taskList) {
      this.pageRequest.page++;
      this.taskListService.getTasks(this.taskList.id, this.pageRequest)
        .subscribe(tasks => this.tasks = this.tasks.concat(tasks), this.onServiceCallError.bind(this));
    }
  }

  onDeleteTaskListButtonClick() {
    const title = this.translate.instant('attention');
    const content = this.translate.instant('delete_task_list_question');
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      restoreFocus: false,
      data: {title, content}
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result.result) {
        this.deleteTaskList();
      }
    });
  }

  private setTaskListModel(taskList: TaskList) {
    this.taskListFormModel = taskList;
    this.taskList = taskList.clone();
  }

  private onTasksLoad(tasks: Task[]) {
    this.tasks = tasks;
  }

  private saveTaskList() {
    if (Strings.isBlank(this.taskListFormModel.name)) {
      this.taskListFormModel.name = this.taskList.name;
    }

    if (!this.taskListFormModel.equals(this.taskList)) {
      this.taskListService.updateTaskList(this.taskListFormModel)
        .subscribe(savedTaskList => this.setTaskListModel(savedTaskList), this.onServiceCallError.bind(this));
    }
  }

  private deleteTaskList() {
    this.taskListService.deleteTaskList(this.taskListFormModel).subscribe(_ => {
      this.router.navigate([this.translate.currentLang, 'task'], {fragment: TaskGroup.TODAY.value}).then();
    }, this.onServiceCallError.bind(this));
  }

  private beginTitleEditing() {
    this.titleEditing = true;
    setTimeout(() => this.titleElement.nativeElement.focus(), 0);
  }

  private endTitleEditing() {
    this.saveTaskList();
    this.titleEditing = false;
  }

  private createTask() {
    if (!Strings.isBlank(this.taskFormModel.title)) {
      this.taskFormModel.status = TaskStatus.PROCESSED;
      this.taskService.createTask(this.taskFormModel).subscribe(task => {
        this.tasks.push(task);
        this.taskForm.resetForm();
        this.taskService.updateTaskCounters();
      }, this.onServiceCallError.bind(this));
    }
  }
}
