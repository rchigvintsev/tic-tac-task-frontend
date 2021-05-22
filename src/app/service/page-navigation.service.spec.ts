import {getTestBed, TestBed} from '@angular/core/testing';
import {TranslateService} from '@ngx-translate/core';
import {Router} from '@angular/router';

import {TestSupport} from '../test/test-support';
import {PageNavigationService} from './page-navigation.service';
import {TaskGroup} from '../model/task-group';

const CURRENT_LANG = 'en';

describe('PageNavigationService', () => {
  let router: Router;
  let service: PageNavigationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: TestSupport.IMPORTS,
      declarations: TestSupport.DECLARATIONS,
      providers: [{provide: Router, useValue: {navigate: () => Promise.resolve(true), routerState: {snapshot: {}}}}]
    });

    const injector = getTestBed();

    const translateService = injector.inject(TranslateService);
    translateService.currentLang = CURRENT_LANG;

    router = injector.inject(Router);
    spyOn(router, 'navigate').and.callThrough();

    service = injector.inject(PageNavigationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should navigate to home page', () => {
    service.navigateToHomePage();
    expect(router.navigate).toHaveBeenCalledWith([CURRENT_LANG]);
  });

  it('should navigate to task group page', () => {
    const taskGroup = TaskGroup.TODAY;
    service.navigateToTaskGroupPage(taskGroup);
    expect(router.navigate).toHaveBeenCalledWith([CURRENT_LANG, 'task'], {fragment: taskGroup.value});
  });

  it('should throw error on navigate to task group page when task group is null', () => {
    expect(() => service.navigateToTaskGroupPage(null)).toThrow(new Error('Task group must not be null or undefined'));
  });

  it('should navigate to signin page', () => {
    service.navigateToSigninPage();
    expect(router.navigate).toHaveBeenCalledWith([CURRENT_LANG, 'signin']);
  });

  it('should navigate to not found error page', () => {
    service.navigateToNotFoundErrorPage();
    expect(router.navigate).toHaveBeenCalledWith([CURRENT_LANG, 'error', '404']);
  });

  it('should return "true" on signin page check when current page is singin page', () => {
    const routerSnapshot = router.routerState.snapshot;
    routerSnapshot.url = `/${CURRENT_LANG}/signin`;
    expect(service.isOnSigninPage()).toBeTruthy();
  });

  it('should return "false" on signin page check when current page is not singin page', () => {
    const routerSnapshot = router.routerState.snapshot;
    routerSnapshot.url = `/${CURRENT_LANG}/test`;
    expect(service.isOnSigninPage()).toBeFalsy();
  });
});
