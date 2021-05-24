import {Component, OnDestroy, OnInit} from '@angular/core';

import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

import {AlertService} from '../../../service/alert.service';
import {Message} from '../../../model/message';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.scss']
})
export class AlertComponent implements OnInit, OnDestroy {
  message: Message;
  alertClass = 'alert';

  private componentDestroyed = new Subject<boolean>();

  constructor(private alertService: AlertService) {
  }

  ngOnInit() {
    this.alertService.getMessage()
      .pipe(takeUntil(this.componentDestroyed))
      .subscribe(message => this.onMessage(message));
  }

  ngOnDestroy(): void {
    this.componentDestroyed.next(true);
    this.componentDestroyed.complete();
  }

  private onMessage(message: Message) {
    this.message = message;

    const classes = ['alert'];
    if (message) {
      if (message.isInfo()) {
        classes.push('alert-info');
      } else if (message.isWarning()) {
        classes.push('alert-warn');
      } else if (message.isError()) {
        classes.push('alert-error');
      }
    }
    this.alertClass = classes.join(' ');
  }
}
