import {Component, OnInit} from '@angular/core';

import {Task} from '../model/task';
import {TaskService} from '../service/task.service';

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.styl']
})
export class TasksComponent implements OnInit {
  tasks: Array<Task>;

  constructor(private taskService: TaskService) { }

  ngOnInit() {
    this.taskService.getTasks().subscribe(tasks => { this.tasks = tasks })
  }

}
