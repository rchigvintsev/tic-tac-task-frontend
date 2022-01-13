import {ComponentFixture, getTestBed, TestBed, waitForAsync} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {NavigationEnd, Router, RouterEvent} from '@angular/router';

import {Subject} from 'rxjs';

import {TranslateService} from '@ngx-translate/core';

import {TestSupport} from '../../../../test/test-support';
import {AdminSidenavMenuComponent} from './admin-sidenav-menu.component';

describe('AdminSidenavMenuComponent', () => {
  let component: AdminSidenavMenuComponent;
  let fixture: ComponentFixture<AdminSidenavMenuComponent>;
  let routerEvents: Subject<RouterEvent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: TestSupport.IMPORTS,
      declarations: TestSupport.DECLARATIONS
    }).compileComponents();
  }));

  beforeEach(() => {
    const injector = getTestBed();

    const translate = injector.inject(TranslateService);
    translate.currentLang = 'en';

    routerEvents = new Subject();
    const router = injector.inject(Router);
    (router as any).events = routerEvents.asObservable();

    fixture = TestBed.createComponent(AdminSidenavMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should highlight selected menu item', async () => {
    routerEvents.next(new NavigationEnd(1, '/en/admin/users', null));
    await fixture.whenStable();
    fixture.detectChanges();
    const selectedItem = fixture.debugElement.query(By.css('.mat-list .mat-list-item.selected[href="/en/admin/users"]'));
    expect(selectedItem).toBeTruthy();
  });
});
