import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';

import {flatMap, map} from 'rxjs/operators';

import {BaseTasksComponent, MenuItem} from '../fragment/base-tasks/base-tasks.component';
import {ConfirmationDialogComponent} from '../fragment/confirmation-dialog/confirmation-dialog.component';
import {WebServiceBasedComponentHelper} from '../web-service-based-component-helper';
import {TaskService} from '../../service/task.service';
import {TaskListService} from '../../service/task-list.service';
import {I18nService} from '../../service/i18n.service';
import {PageNavigationService} from '../../service/page-navigation.service';
import {Task} from '../../model/task';
import {TaskList} from '../../model/task-list';
import {TaskGroup} from '../../model/task-group';
import {Strings} from '../../util/strings';
import {HttpErrors} from '../../util/http-errors';

@Component({
  selector: 'app-task-list-tasks',
  templateUrl: '../fragment/base-tasks/base-tasks.component.html',
  styleUrls: ['../fragment/base-tasks/base-tasks.component.styl']
})
export class TaskListTasksComponent extends BaseTasksComponent implements OnInit {
  private taskList: TaskList;

  constructor(i18nService: I18nService,
              componentHelper: WebServiceBasedComponentHelper,
              taskService: TaskService,
              private taskListService: TaskListService,
              private pageNavigationService: PageNavigationService,
              private route: ActivatedRoute,
              private dialog: MatDialog) {
    super(i18nService, taskService, componentHelper);
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
    ).subscribe(tasks => this.tasks = tasks, errorResponse => {
      if (HttpErrors.isNotFound(errorResponse)) {
        this.pageNavigationService.navigateToNotFoundErrorPage();
      } else {
        const messageToDisplay = this.i18nService.translate('task_loading_error');
        this.componentHelper.handleWebServiceCallError(errorResponse, messageToDisplay);
      }
    });
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
      this.taskListService.getTasks(this.taskList.id, this.pageRequest).subscribe(
        tasks => this.tasks = this.tasks.concat(tasks),
        errorResponse => {
          const messageToDisplay = this.i18nService.translate('task_loading_error');
          this.componentHelper.handleWebServiceCallError(errorResponse, messageToDisplay);
        }
      );
    }
  }

  onCompleteTaskListButtonClick() {
    const title = this.i18nService.translate('attention');
    const content = this.i18nService.translate('complete_task_list_question');
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
    const title = this.i18nService.translate('attention');
    const content = this.i18nService.translate('delete_task_list_question');
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

  protected afterTaskCreate(task: Task) {
    this.taskListService.addTask(this.taskList.id, task.id).subscribe(_ => {
      task.taskListId = this.taskList.id;
      super.afterTaskCreate(task);
    }, errorResponse => this.componentHelper.handleWebServiceCallError(errorResponse));
  }

  protected onTitleEditingEnd() {
    if (!Strings.isBlank(this.title) && this.title !== this.taskList.name) {
      this.taskList.name = this.title;
      this.saveTaskList();
    }
  }

  private setTaskList(taskList: TaskList) {
    this.taskList = taskList;
    this.title = taskList.name;
  }

  private saveTaskList() {
    this.taskListService.updateTaskList(this.taskList).subscribe(
      updatedTaskList => this.setTaskList(updatedTaskList),
      errorResponse => this.componentHelper.handleWebServiceCallError(errorResponse)
    );
  }

  private completeTaskList() {
    this.taskListService.completeTaskList(this.taskList).subscribe(
      _ => this.pageNavigationService.navigateToTaskGroupPage(TaskGroup.TODAY),
      errorResponse => this.componentHelper.handleWebServiceCallError(errorResponse)
    );
  }

  private deleteTaskList() {
    this.taskListService.deleteTaskList(this.taskList).subscribe(
      _ => this.pageNavigationService.navigateToTaskGroupPage(TaskGroup.TODAY),
      errorResponse => this.componentHelper.handleWebServiceCallError(errorResponse)
    );
  }
}
