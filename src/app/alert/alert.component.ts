import {Component, OnDestroy, OnInit} from '@angular/core';

import {Subscription} from 'rxjs';

import {AlertService} from '../service/alert.service';
import {Message} from '../model/message';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.styl']
})
export class AlertComponent implements OnInit, OnDestroy {
  message: Message;
  alertClass = 'alert';

  private messageSubscription: Subscription;

  constructor(private alertService: AlertService) {
  }

  ngOnInit() {
    this.messageSubscription = this.alertService.getMessage().subscribe(message => this.onMessage(message));
  }

  ngOnDestroy(): void {
    this.messageSubscription.unsubscribe();
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
