import {Component, Input, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';

import {Task} from '../model/task';
import {TaskService} from '../service/task.service';

@Component({
  selector: 'app-task-detail',
  templateUrl: './task-detail.component.html',
  styleUrls: ['./task-detail.component.styl']
})
export class TaskDetailComponent implements OnInit {
  @Input() task: Task;

  constructor(private route: ActivatedRoute, private taskService: TaskService) {
  }

  ngOnInit() {
    const taskId = +this.route.snapshot.paramMap.get('id');
    this.taskService.getTask(taskId).subscribe(task => this.task = task);
  }

  saveTask() {
    this.taskService.saveTask(this.task).subscribe(task => this.task = task);
  }
}
