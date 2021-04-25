import {Injectable} from '@angular/core';
import {Router} from '@angular/router';

import {I18nService} from './i18n.service';
import {TaskGroup} from '../model/task-group';
import {Assert} from '../util/assert';

@Injectable({providedIn: 'root'})
export class PageNavigationService {
  constructor(public router: Router, private i18nService: I18nService) {
  }

  isOnSigninPage(): boolean {
    const routerState = this.router.routerState.snapshot;
    return /\/\w+\/signin/.test(routerState.url);
  }

  navigateToHomePage(): Promise<boolean> {
    const currentLang = this.i18nService.currentLanguage;
    return this.router.navigate([currentLang.code]).then();
  }

  navigateToTaskGroupPage(taskGroup: TaskGroup): Promise<boolean> {
    Assert.notNullOrUndefined(taskGroup, 'Task group must not be null or undefined');
    const currentLang = this.i18nService.currentLanguage;
    return this.router.navigate([currentLang.code, 'task'], {fragment: taskGroup.value});
  }

  navigateToSigninPage(queryParams: any = null): Promise<boolean> {
    const commands = [this.i18nService.currentLanguage.code, 'signin'];
    if (queryParams) {
      return this.router.navigate(commands, {queryParams});
    }
    return this.router.navigate(commands);
  }

  navigateToNotFoundErrorPage(): Promise<boolean> {
    const currentLang = this.i18nService.currentLanguage;
    return this.router.navigate([currentLang.code, 'error', '404']);
  }
}
