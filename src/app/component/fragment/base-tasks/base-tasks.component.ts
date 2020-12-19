import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {NgForm} from '@angular/forms';

import {TranslateService} from '@ngx-translate/core';

import {WebServiceBasedComponent} from '../../web-service-based.component';
import {Task} from '../../../model/task';
import {TaskStatus} from '../../../model/task-status';
import {TaskService} from '../../../service/task.service';
import {AuthenticationService} from '../../../service/authentication.service';
import {LogService} from '../../../service/log.service';
import {PageRequest} from '../../../service/page-request';
import {Strings} from '../../../util/strings';

export class MenuItem {
  constructor(public readonly name: string, public readonly handler: () => void) {
  }
}

@Component({
  selector: 'app-base-tasks',
  templateUrl: './base-tasks.component.html',
  styleUrls: ['./base-tasks.component.styl']
})
export class BaseTasksComponent extends WebServiceBasedComponent implements OnInit {
  title = '';
  titleMaxLength = 50;
  titlePlaceholder = '';
  titleEditing = false;
  taskListMenuItems: MenuItem[] = [];
  taskFormEnabled = false;
  taskFormModel = new Task();
  tasks: Array<Task>;

  @ViewChild('titleInput')
  titleElement: ElementRef;
  @ViewChild('taskForm')
  taskForm: NgForm;

  protected pageRequest = new PageRequest();

  constructor(router: Router,
              translate: TranslateService,
              authenticationService: AuthenticationService,
              log: LogService,
              private taskService: TaskService) {
    super(translate, router, authenticationService, log);
  }

  ngOnInit(): void {
    this.titlePlaceholder = this.translate.instant('title');
  }

  onTitleTextClick() {
    this.beginTitleEditing();
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

  onTaskFormSubmit() {
    this.createTask();
  }

  onTaskListScroll(event: any) {
  }

  onTaskCompleteCheckboxChange(task: Task) {
    // Let animation to complete
    setTimeout(() => {
      this.completeTask(task);
    }, 300);
  }

  protected getTaskListMenuItems(): MenuItem[] {
    return [];
  }

  protected onTitleEditingBegin() {
  }

  protected onTitleEditingEnd() {
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
      this.taskFormModel.status = TaskStatus.PROCESSED;
      this.taskService.createTask(this.taskFormModel).subscribe(task => {
        this.tasks.push(task);
        this.taskForm.resetForm();
        this.taskService.updateTaskCounters();
      }, this.onServiceCallError.bind(this));
    }
  }

  private completeTask(task: Task) {
    this.taskService.completeTask(task).subscribe(_ => {
      this.tasks = this.tasks.filter(e => e.id !== task.id);
      this.taskService.updateTaskCounters();
    }, this.onServiceCallError.bind(this));
  }
}
