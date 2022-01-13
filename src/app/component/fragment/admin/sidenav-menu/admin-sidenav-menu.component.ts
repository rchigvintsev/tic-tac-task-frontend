import {Component, OnDestroy, OnInit} from '@angular/core';
import {NavigationEnd, Router, RouterEvent} from '@angular/router';

import {Subject} from 'rxjs';

import {I18nService} from '../../../../service/i18n.service';
import {PathMatcher} from '../../../../util/path-matcher';

@Component({
  selector: 'app-admin-sidenav-menu',
  templateUrl: './admin-sidenav-menu.component.html',
  styleUrls: ['./admin-sidenav-menu.component.scss']
})
export class AdminSidenavMenuComponent implements OnInit, OnDestroy {
  private pathMatcher: PathMatcher;
  private componentDestroyed = new Subject<boolean>();

  constructor(public i18nService: I18nService, private router: Router) {
  }

  ngOnInit() {
    this.pathMatcher = PathMatcher.fromUrlTree(this.router.parseUrl(this.router.url));
    this.router.events.subscribe((event: RouterEvent) => {
      if (event instanceof NavigationEnd) {
        this.onNavigationEnd(event);
      }
    });
  }

  ngOnDestroy(): void {
    this.componentDestroyed.next(true);
    this.componentDestroyed.complete();
  }

  isRouterLinkActive(path: string, fragment: string = null): boolean {
    return this.pathMatcher && this.pathMatcher.matches(path, fragment);
  }

  isFocused(path: string, fragment: string = null): boolean {
    return this.pathMatcher && this.pathMatcher.matches(path, fragment);
  }

  private onNavigationEnd(e: NavigationEnd) {
    this.pathMatcher = PathMatcher.fromUrlTree(this.router.parseUrl(e.url));
  }
}
