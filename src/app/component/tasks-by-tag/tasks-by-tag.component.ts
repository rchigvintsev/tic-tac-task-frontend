import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';

import {flatMap, map} from 'rxjs/operators';

import {TranslateService} from '@ngx-translate/core';

import {WebServiceBasedComponent} from '../web-service-based.component';
import {AuthenticationService} from '../../service/authentication.service';
import {LogService} from '../../service/log.service';
import {TagService} from '../../service/tag.service';
import {PageRequest} from '../../service/page-request';
import {TaskGroup} from '../../model/task-group';
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
              private tagService: TagService) {
    super(translate, router, authenticationService, log);
  }

  ngOnInit() {
    this.route.params.pipe(
      map(params => +params.id),
      flatMap(tagId => this.tagService.getTag(tagId)),
      flatMap(tag => {
        this.tag = tag;
        this.title = tag.name;
        return this.tagService.getUncompletedTasks(tag.id, this.pageRequest);
      })
    ).subscribe(tasks => this.tasks = tasks, this.onServiceCallError.bind(this));
    this.tagService.getDeletedTag().subscribe(tag => {
      if (this.tag && this.tag.id === tag.id) {
        this.router.navigate([this.translate.currentLang, 'task'], {fragment: TaskGroup.TODAY.value}).then();
      }
    });
  }

  onTaskListScroll() {
    if (this.tag) {
      this.pageRequest.page++;
      this.tagService.getUncompletedTasks(this.tag.id, this.pageRequest)
        .subscribe(tasks => this.tasks = this.tasks.concat(tasks), this.onServiceCallError.bind(this));
    }
  }
}
