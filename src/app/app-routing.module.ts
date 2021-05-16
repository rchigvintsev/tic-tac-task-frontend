import {APP_INITIALIZER, ModuleWithProviders, NgModule, NgModuleFactoryLoader, Optional, SkipSelf} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {Location} from '@angular/common';

import {TranslateService} from '@ngx-translate/core';

import {
  CACHE_MECHANISM,
  CACHE_NAME,
  DEFAULT_LANG_FUNCTION,
  DummyLocalizeParser,
  getAppInitializer,
  LOCALIZE_ROUTER_FORROOT_GUARD,
  LocalizeParser,
  LocalizeRouterConfigLoader,
  LocalizeRouterModule,
  LocalizeRouterService,
  LocalizeRouterSettings,
  ManualParserLoader,
  ParserInitializer,
  provideForRootGuard,
  RAW_ROUTES,
  USE_CACHED_LANG
} from 'localize-router';
import {LocalizeRouterConfig} from 'localize-router/src/localize-router.config';

import {TaskGroupTasksComponent} from './component/task-group-tasks/task-group-tasks.component';
import {TagTasksComponent} from './component/tag-tasks/tag-tasks.component';
import {TaskListTasksComponent} from './component/task-list-tasks/task-list-tasks.component';
import {TaskDetailsComponent} from './component/task-details/task-details.component';
import {SigninComponent} from './component/signin/signin.component';
import {SignupComponent} from './component/signup/signup.component';
import {PasswordResetComponent} from './component/password-reset/password-reset.component';
import {PasswordResetConfirmationComponent} from './component/password-reset-confirmation/password-reset-confirmation.component';
import {ErrorNotFoundComponent} from './component/error-not-found/error-not-found.component';
import {DummyComponent} from './component/dummy/dummy.component';
import {AVAILABLE_LANGUAGES} from './service/i18n.service';
import {
  AuthenticatedOnlyRouteGuard,
  EmailConfirmationCallbackRouteGuard,
  LocalizedRouteGuard,
  OAuth2AuthorizationCallbackRouteGuard,
  PasswordResetConfirmationCallbackRouteGuard,
  UnauthenticatedOnlyRouteGuard
} from './route.guard';

export const _routes: Routes = [
  {path: '', redirectTo: 'task', pathMatch: 'full'},
  {path: 'task', component: TaskGroupTasksComponent, canActivate: [AuthenticatedOnlyRouteGuard]},
  {path: 'task/:id', component: TaskDetailsComponent, canActivate: [AuthenticatedOnlyRouteGuard]},
  {path: 'tag/:id', component: TagTasksComponent, canActivate: [AuthenticatedOnlyRouteGuard]},
  {path: 'task-list/:id', component: TaskListTasksComponent, canActivate: [AuthenticatedOnlyRouteGuard]},
  {path: 'signin', component: SigninComponent, canActivate: [UnauthenticatedOnlyRouteGuard]},
  {path: 'signup', component: SignupComponent, canActivate: [UnauthenticatedOnlyRouteGuard]},
  {
    path: 'oauth2/authorization/callback',
    component: DummyComponent,
    canActivate: [OAuth2AuthorizationCallbackRouteGuard]
  },
  {path: 'account/password/reset', component: PasswordResetComponent, canActivate: [UnauthenticatedOnlyRouteGuard]},
  {
    path: 'account/password/reset/confirmation',
    component: PasswordResetConfirmationComponent,
    canActivate: [UnauthenticatedOnlyRouteGuard, PasswordResetConfirmationCallbackRouteGuard]
  },
  {path: 'account/email/confirmation', component: DummyComponent, canActivate: [EmailConfirmationCallbackRouteGuard]},
  {path: 'error/404', component: ErrorNotFoundComponent},
  {path: '**', component: DummyComponent, canActivate: [LocalizedRouteGuard]}
];

export function LocalizeHttpLoaderFactory(translate: TranslateService,
                                          location: Location,
                                          settings: LocalizeRouterSettings) {
  return new ManualParserLoader(translate, location, settings, Array.from(AVAILABLE_LANGUAGES.keys()));
}

@NgModule()
class CustomLocalizeRouterModule extends LocalizeRouterModule {
  static forRoot(routes: Routes, config?: LocalizeRouterConfig): ModuleWithProviders<any> {
    return {
      ngModule: CustomLocalizeRouterModule,
      providers: [
        {
          provide: LOCALIZE_ROUTER_FORROOT_GUARD,
          useFactory: provideForRootGuard,
          deps: [[LocalizeRouterModule, new Optional(), new SkipSelf()]]
        },
        {provide: USE_CACHED_LANG, useValue: config.useCachedLang},
        {provide: CACHE_NAME, useValue: config.cacheName},
        {provide: CACHE_MECHANISM, useValue: config.cacheMechanism},
        {provide: DEFAULT_LANG_FUNCTION, useValue: config.defaultLangFunction},
        LocalizeRouterSettings,
        config.parser || {provide: LocalizeParser, useClass: DummyLocalizeParser},
        {provide: RAW_ROUTES, multi: true, useValue: routes},
        LocalizeRouterService,
        ParserInitializer,
        {provide: NgModuleFactoryLoader, useClass: LocalizeRouterConfigLoader},
        {
          provide: APP_INITIALIZER,
          multi: true,
          useFactory: getAppInitializer,
          deps: [ParserInitializer, LocalizeParser, RAW_ROUTES]
        }
      ]
    } as ModuleWithProviders<any>;
  }
}

@NgModule({
  imports: [
    CustomLocalizeRouterModule.forRoot(_routes, {
      parser: {
        provide: LocalizeParser,
        useFactory: LocalizeHttpLoaderFactory,
        deps: [TranslateService, Location, LocalizeRouterSettings]
      }
    }),
    RouterModule.forRoot(_routes)
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
