import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';

import {flatMap, map} from 'rxjs/operators';

import {TranslateService} from '@ngx-translate/core';

import {WebServiceBasedComponent} from '../web-service-based.component';
import {AuthenticationService} from '../../service/authentication.service';
import {LogService} from '../../service/log.service';
import {TagService} from '../../service/tag.service';
import {TaskService} from '../../service/task.service';
import {PageRequest} from '../../service/page-request';
import {Tag} from '../../model/tag';
import {Task} from '../../model/task';

@Component({
  selector: 'app-tasks-by-tag',
  templateUrl: './tasks-by-tag.component.html',
  styleUrls: ['./tasks-by-tag.component.styl']
})
export class TasksByTagComponent extends WebServiceBasedComponent implements OnInit {
  title: string;
  tasks: Array<Task>;

  private tag: Tag;
  private pageRequest = new PageRequest();

  constructor(translate: TranslateService,
              router: Router,
              authenticationService: AuthenticationService,
              log: LogService,
              private route: ActivatedRoute,
              private tagService: TagService,
              private taskService: TaskService) {
    super(translate, router, authenticationService, log);
  }

  ngOnInit() {
    this.route.params.pipe(
      map(params => +params.id),
      flatMap(tagId => this.tagService.getTag(tagId)),
      flatMap(tag => {
        this.tag = tag;
        this.title = tag.name;
        return this.taskService.getTasksByTag(tag, this.pageRequest);
      })
    ).subscribe(tasks => this.tasks = tasks, this.onServiceCallError.bind(this));
  }

  onTaskListScroll() {
    if (this.tag) {
      this.pageRequest.page++;
      this.taskService.getTasksByTag(this.tag, this.pageRequest)
        .subscribe(tasks => this.tasks = this.tasks.concat(tasks), this.onServiceCallError.bind(this));
    }
  }
}
