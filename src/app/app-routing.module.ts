import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {Location} from '@angular/common';

import {TranslateService} from '@ngx-translate/core';
import {LocalizeParser, LocalizeRouterModule, LocalizeRouterSettings, ManualParserLoader} from '@gilsdav/ngx-translate-router';

import {TasksByGroupComponent} from './component/tasks/by-group/tasks-by-group.component';
import {TasksByTagComponent} from './component/tasks/by-tag/tasks-by-tag.component';
import {TasksFromListComponent} from './component/tasks/from-list/tasks-from-list.component';
import {TaskArchiveComponent} from './component/tasks/archive/task-archive.component';
import {TaskDetailsComponent} from './component/task/details/task-details.component';
import {SigninComponent} from './component/signin/signin.component';
import {SignupComponent} from './component/signup/signup.component';
import {AccountPasswordResetComponent} from './component/account/password/reset/account-password-reset.component';
import {
  AccountPasswordResetConfirmationComponent
} from './component/account/password/reset/confirmation/account-password-reset-confirmation.component';
import {ErrorNotFoundComponent} from './component/error/not-found/error-not-found.component';
import {DummyComponent} from './component/dummy/dummy.component';
import {AdminUsersComponent} from './component/admin/users/admin-users.component';
import {
  AdminOnlyRouteGuard,
  AuthenticatedOnlyRouteGuard,
  EmailConfirmationCallbackRouteGuard,
  LocalizedRouteGuard,
  OAuth2AuthorizationCallbackRouteGuard,
  PasswordResetConfirmationCallbackRouteGuard,
  UnauthenticatedOnlyRouteGuard
} from './route.guard';
import {AVAILABLE_LANGUAGES} from './service/i18n.service';

export const routes: Routes = [
  {path: '', redirectTo: 'task', pathMatch: 'full'},
  {path: 'task', component: TasksByGroupComponent, canActivate: [AuthenticatedOnlyRouteGuard]},
  {path: 'task/:id', component: TaskDetailsComponent, canActivate: [AuthenticatedOnlyRouteGuard]},
  {path: 'tag/:id', component: TasksByTagComponent, canActivate: [AuthenticatedOnlyRouteGuard]},
  {path: 'task-list/:id', component: TasksFromListComponent, canActivate: [AuthenticatedOnlyRouteGuard]},
  {path: 'archive', component: TaskArchiveComponent, canActivate: [AuthenticatedOnlyRouteGuard]},
  {path: 'signin', component: SigninComponent, canActivate: [UnauthenticatedOnlyRouteGuard]},
  {path: 'signup', component: SignupComponent, canActivate: [UnauthenticatedOnlyRouteGuard]},
  {path: 'oauth2/authorization/callback', component: DummyComponent, canActivate: [OAuth2AuthorizationCallbackRouteGuard]},
  {path: 'account/password/reset', component: AccountPasswordResetComponent, canActivate: [UnauthenticatedOnlyRouteGuard]},
  {
    path: 'account/password/reset/confirmation',
    component: AccountPasswordResetConfirmationComponent,
    canActivate: [UnauthenticatedOnlyRouteGuard, PasswordResetConfirmationCallbackRouteGuard]
  },
  {path: 'account/email/confirmation', component: DummyComponent, canActivate: [EmailConfirmationCallbackRouteGuard]},
  {path: 'admin/users', component: AdminUsersComponent, canActivate: [AdminOnlyRouteGuard]},
  {path: 'error/404', component: ErrorNotFoundComponent},
  {path: '**', component: DummyComponent, canActivate: [LocalizedRouteGuard]}
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes),
    LocalizeRouterModule.forRoot(routes, {
      parser: {
        provide: LocalizeParser,
        useFactory: (translate, location, settings) => {
          const locales = Array.from(AVAILABLE_LANGUAGES.keys());
          return new ManualParserLoader(translate, location, settings, locales)
        },
        deps: [TranslateService, Location, LocalizeRouterSettings]
      }
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
