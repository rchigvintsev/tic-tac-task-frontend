import {Injectable} from '@angular/core';
import {Router} from '@angular/router';

import {I18nService} from './i18n.service';
import {TaskGroup} from '../model/task-group';

@Injectable({providedIn: 'root'})
export class PageNavigationService {
  constructor(public router: Router, private i18nService: I18nService) {
  }

  navigateToHomePage() {
    const currentLang = this.i18nService.currentLanguage;
    this.router.navigate([currentLang.code]).then();
  }

  navigateToTaskGroupPage(taskGroup: TaskGroup) {
    const currentLang = this.i18nService.currentLanguage;
    this.router.navigate([currentLang.code, 'task'], {fragment: taskGroup.value});
  }

  navigateToSigninPage(queryParams: any = null) {
    const commands = [this.i18nService.currentLanguage.code, 'signin'];
    if (queryParams) {
      this.router.navigate(commands, {queryParams});
    } else {
      this.router.navigate(commands);
    }
  }

  navigateToNotFoundErrorPage() {
    const currentLang = this.i18nService.currentLanguage;
    this.router.navigate([currentLang.code, 'error', '404']);
  }
}
