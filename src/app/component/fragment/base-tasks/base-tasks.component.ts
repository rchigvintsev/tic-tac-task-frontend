import {Component, ElementRef, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';

import {Observable} from 'rxjs';

import {WebServiceBasedComponentHelper} from '../../web-service-based-component-helper';
import {I18nService} from '../../../service/i18n.service';
import {TaskService} from '../../../service/task.service';
import {ProgressSpinnerService} from '../../../service/progress-spinner.service';
import {PageNavigationService} from '../../../service/page-navigation.service';
import {Task} from '../../../model/task';
import {TaskStatus} from '../../../model/task-status';
import {PageRequest} from '../../../service/page-request';
import {Strings} from '../../../util/strings';
import {HttpErrors} from '../../../util/http-errors';

export class MenuItem {
  constructor(public readonly name: string, public readonly handler: () => void) {
  }
}

@Component({
  selector: 'app-base-tasks',
  templateUrl: './base-tasks.component.html',
  styleUrls: ['./base-tasks.component.styl']
})
export class BaseTasksComponent {
  title = '';
  titleReadonly = false;
  titleMaxLength = 255;
  titlePlaceholder = 'title';
  titleEditing = false;
  taskListMenuItems: MenuItem[] = [];
  taskFormEnabled = false;
  taskFormSubmitEnabled = false;
  taskFormModel = new Task();
  tasks: Array<Task>;
  showInlineSpinner: boolean;

  @ViewChild('titleInput')
  titleElement: ElementRef;
  @ViewChild('taskForm')
  taskForm: NgForm;

  protected pageRequest = new PageRequest();

  constructor(public i18nService: I18nService,
              protected taskService: TaskService,
              protected progressSpinnerService: ProgressSpinnerService,
              protected pageNavigationService: PageNavigationService,
              protected componentHelper: WebServiceBasedComponentHelper) {
  }

  onTitleTextClick() {
    if (!this.titleReadonly) {
      this.beginTitleEditing();
    }
  }

  onTitleInputBlur() {
    this.endTitleEditing();
  }

  onTitleInputEnterKeydown() {
    if (!Strings.isBlank(this.title)) {
      this.endTitleEditing();
    }
  }

  onTitleInputEscapeKeydown() {
    this.endTitleEditing();
  }

  onTaskFormModelChange() {
    this.taskFormSubmitEnabled = !Strings.isBlank(this.taskFormModel.title);
  }

  onTaskFormSubmit() {
    this.createTask();
  }

  onTaskListScroll(event: any) {
  }

  onTaskCompleteCheckboxChange(task: Task) {
    // Let animation to complete
    setTimeout(() => this.completeTask(task), 300);
  }

  protected onTitleEditingBegin() {
  }

  protected onTitleEditingEnd() {
  }

  protected reloadTasks(loadFunction: () => Observable<Task[]>) {
    this.pageRequest.page = 0;
    this.progressSpinnerService.showUntilExecuted(loadFunction(), tasks => this.tasks = tasks,
        error => this.onTasksLoadError(error));
  }

  protected loadMoreTasks(loadFunction: () => Observable<Task[]>) {
    this.showInlineSpinner = true;
    this.pageRequest.page++;
    loadFunction().subscribe(tasks => {
      this.tasks = this.tasks.concat(tasks);
      this.showInlineSpinner = false;
    }, error => this.onTasksLoadError(error));
  }

  protected beforeTaskCreate(task: Task) {
    task.status = TaskStatus.PROCESSED;
  }

  protected afterTaskCreate(task: Task) {
    this.tasks.push(task);
    this.taskForm.resetForm();
    this.taskService.updateTaskCounters();
  }

  private onTasksLoadError(error: any) {
    this.showInlineSpinner = false;
    if (HttpErrors.isNotFound(error)) {
      this.pageNavigationService.navigateToNotFoundErrorPage();
    } else {
      const messageToDisplay = this.i18nService.translate('failed_to_load_tasks');
      this.componentHelper.handleWebServiceCallError(error, messageToDisplay);
    }
  }

  private beginTitleEditing() {
    this.titleEditing = true;
    setTimeout(() => this.titleElement.nativeElement.focus(), 0);
    this.onTitleEditingBegin();
  }

  private endTitleEditing() {
    this.titleEditing = false;
    this.onTitleEditingEnd();
  }

  private createTask() {
    if (!Strings.isBlank(this.taskFormModel.title)) {
      this.beforeTaskCreate(this.taskFormModel);
      this.taskService.createTask(this.taskFormModel).subscribe(
        task => this.afterTaskCreate(task),
        errorResponse => {
          const messageToDisplay = this.i18nService.translate('failed_to_save_task');
          this.componentHelper.handleWebServiceCallError(errorResponse, messageToDisplay);
        }
      );
    }
  }

  private completeTask(task: Task) {
    this.taskService.completeTask(task).subscribe(_ => {
      this.tasks = this.tasks.filter(e => e.id !== task.id);
      this.taskService.updateTaskCounters();
    }, errorResponse => {
      const messageToDisplay = this.i18nService.translate('failed_to_complete_task');
      this.componentHelper.handleWebServiceCallError(errorResponse, messageToDisplay);
    });
  }
}
