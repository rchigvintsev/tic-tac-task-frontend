import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {Location} from '@angular/common';

import {TranslateService} from '@ngx-translate/core';

import {LocalizeParser, LocalizeRouterModule, LocalizeRouterSettings, ManualParserLoader} from 'localize-router';
import {TasksByGroupComponent} from './component/tasks-by-group/tasks-by-group.component';
import {TasksByTagComponent} from './component/tasks-by-tag/tasks-by-tag.component';
import {TaskDetailsComponent} from './component/task-details/task-details.component';
import {SigninComponent} from './component/signin/signin.component';
import {NotFoundComponent} from './component/not-found/not-found.component';
import {DummyComponent} from './component/dummy/dummy.component';
import {AVAILABLE_LANGUAGES} from './service/i18n.service';
import {
  AuthenticatedOnlyRouteGuard,
  LocalizedRouteGuard,
  OAuth2AuthorizationCallbackRouteGuard,
  UnauthenticatedOnlyRouteGuard
} from './route.guard';

export const routes: Routes = [
  {path: '', redirectTo: 'task', pathMatch: 'full'},
  {path: 'task', component: TasksByGroupComponent, canActivate: [AuthenticatedOnlyRouteGuard]},
  {path: 'task/:id', component: TaskDetailsComponent, canActivate: [AuthenticatedOnlyRouteGuard]},
  {path: 'tag/:id', component: TasksByTagComponent, canActivate: [AuthenticatedOnlyRouteGuard]},
  {path: 'signin', component: SigninComponent, canActivate: [UnauthenticatedOnlyRouteGuard]},
  {
    path: 'oauth2/authorization/callback',
    component: DummyComponent,
    canActivate: [OAuth2AuthorizationCallbackRouteGuard]
  },
  {path: 'error/404', component: NotFoundComponent},
  {path: '**', component: DummyComponent, canActivate: [LocalizedRouteGuard]}
];

export function LocalizeHttpLoaderFactory(translate: TranslateService,
                                          location: Location,
                                          settings: LocalizeRouterSettings) {
  return new ManualParserLoader(translate, location, settings, Array.from(AVAILABLE_LANGUAGES.keys()));
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
