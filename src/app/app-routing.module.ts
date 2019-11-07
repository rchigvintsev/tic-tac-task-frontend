import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {Location} from '@angular/common';

import {TranslateService} from '@ngx-translate/core';

import {LocalizeParser, LocalizeRouterModule, LocalizeRouterSettings, ManualParserLoader} from 'localize-router';

import {DashboardComponent} from './dashboard/dashboard.component';
import {TaskDetailComponent} from './task-detail/task-detail.component';
import {LoginComponent} from './login/login.component';
import {NotFoundComponent} from './not-found/not-found.component';
import {DummyComponent} from './dummy/dummy.component';
import {
  AuthenticatedOnlyRouteGuard,
  LocalizedRouteGuard,
  LoginSuccessRouteGuard,
  UnauthenticatedOnlyRouteGuard
} from './route.guard';
import {AVAILABLE_LANGUAGES} from './language';

export const routes: Routes = [
  {
    path: '', canActivate: [AuthenticatedOnlyRouteGuard], children: [
      {path: '', component: DashboardComponent},
      {path: 'task/:id', component: TaskDetailComponent}
    ]
  },
  {
    path: 'login', component: LoginComponent, canActivate: [UnauthenticatedOnlyRouteGuard], children: [
      {path: 'success', component: DummyComponent, canActivate: [LoginSuccessRouteGuard]}
    ]
  },
  {path: '404', component: NotFoundComponent},
  {path: '**', component: DummyComponent, canActivate: [LocalizedRouteGuard]}
];

export function LocalizeHttpLoaderFactory(translate: TranslateService,
                                          location: Location,
                                          settings: LocalizeRouterSettings) {
  return new ManualParserLoader(translate, location, settings, AVAILABLE_LANGUAGES);
}

@NgModule({
  imports: [
    LocalizeRouterModule.forRoot(routes, {
      parser: {
        provide: LocalizeParser,
        useFactory: LocalizeHttpLoaderFactory,
        deps: [TranslateService, Location, LocalizeRouterSettings]
      }
    }),
    RouterModule.forRoot(routes)
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
