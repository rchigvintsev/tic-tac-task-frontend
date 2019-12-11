import {Injectable} from '@angular/core';
import {NavigationStart, Router} from '@angular/router';

import {BehaviorSubject, Observable} from 'rxjs';

import {Message, MessageType} from '../model/message';

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  private subject = new BehaviorSubject<Message>(null);

  constructor(private router: Router) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.onNavigationStart(event);
      }
    });
  }

  info(text: string) {
    this.subject.next(new Message(MessageType.INFO, text));
  }

  warn(text: string) {
    this.subject.next(new Message(MessageType.WARNING, text));
  }

  error(text: string) {
    this.subject.next(new Message(MessageType.ERROR, text));
  }

  getMessage(): Observable<Message> {
    return this.subject.asObservable();
  }

  private onNavigationStart(_: NavigationStart) {
    this.subject.next(null);
  }
}
