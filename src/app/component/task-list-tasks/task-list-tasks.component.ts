import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';

import {flatMap, map} from 'rxjs/operators';

import {TranslateService} from '@ngx-translate/core';

import {BaseTasksComponent, MenuItem} from '../fragment/base-tasks/base-tasks.component';
import {ConfirmationDialogComponent} from '../fragment/confirmation-dialog/confirmation-dialog.component';
import {AuthenticationService} from '../../service/authentication.service';
import {LogService} from '../../service/log.service';
import {TaskService} from '../../service/task.service';
import {TaskListService} from '../../service/task-list.service';
import {TaskList} from '../../model/task-list';
import {TaskGroup} from '../../model/task-group';
import {Strings} from '../../util/strings';
import {Task} from 'src/app/model/task';

@Component({
  selector: 'app-task-list-tasks',
  templateUrl: '../fragment/base-tasks/base-tasks.component.html',
  styleUrls: ['../fragment/base-tasks/base-tasks.component.styl']
})
export class TaskListTasksComponent extends BaseTasksComponent implements OnInit {
  private taskList: TaskList;

  constructor(router: Router,
              translate: TranslateService,
              authenticationService: AuthenticationService,
              log: LogService,
              taskService: TaskService,
              private taskListService: TaskListService,
              private route: ActivatedRoute,
              private dialog: MatDialog) {
    super(router, translate, authenticationService, log, taskService);
    this.titlePlaceholder = 'task_list_name';
    this.taskFormEnabled = true;
    this.taskListMenuItems = [
      new MenuItem('complete', this.onCompleteTaskListButtonClick.bind(this)),
      new MenuItem('delete', this.onDeleteTaskListButtonClick.bind(this))
    ];
  }

  ngOnInit() {
    this.route.params.pipe(
      map(params => +params.id),
      flatMap(id => this.taskListService.getTaskList(id)),
      flatMap(taskList => {
        this.setTaskList(taskList);
        return this.taskListService.getTasks(taskList.id, this.pageRequest);
      })
    ).subscribe(tasks => this.tasks = tasks, this.onServiceCallError.bind(this));
  }


  onTitleInputEscapeKeydown() {
    if (this.taskList) {
      this.title = this.taskList.name;
    }
    super.onTitleInputEscapeKeydown();
  }

  onTaskListScroll() {
    if (this.taskList) {
      this.pageRequest.page++;
      this.taskListService.getTasks(this.taskList.id, this.pageRequest)
        .subscribe(tasks => this.tasks = this.tasks.concat(tasks), this.onServiceCallError.bind(this));
    }
  }

  onCompleteTaskListButtonClick() {
    const title = this.translate.instant('attention');
    const content = this.translate.instant('complete_task_list_question');
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      restoreFocus: false,
      data: {title, content}
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result.result) {
        this.completeTaskList();
      }
    });
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

  protected onTitleEditingEnd() {
    if (!Strings.isBlank(this.title) && this.title !== this.taskList.name) {
      this.taskList.name = this.title;
      this.saveTaskList();
    }
  }

  protected beforeTaskCreate(task: Task) {
    super.beforeTaskCreate(task);
    task.taskListId = this.taskList.id;
  }

  private setTaskList(taskList: TaskList) {
    this.taskList = taskList;
    this.title = taskList.name;
  }

  private saveTaskList() {
    this.taskListService.updateTaskList(this.taskList)
      .subscribe(updatedTaskList => this.setTaskList(updatedTaskList), this.onServiceCallError.bind(this));
  }

  private completeTaskList() {
    this.taskListService.completeTaskList(this.taskList)
      .subscribe(_ => this.navigateToTodayTaskGroupPage(), this.onServiceCallError.bind(this));
  }

  private deleteTaskList() {
    this.taskListService.deleteTaskList(this.taskList)
      .subscribe(_ => this.navigateToTodayTaskGroupPage(), this.onServiceCallError.bind(this));
  }

  private navigateToTodayTaskGroupPage() {
    this.router.navigate([this.translate.currentLang, 'task'], {fragment: TaskGroup.TODAY.value}).then();
  }
}
