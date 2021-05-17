import {
  APP_INITIALIZER,
  Compiler,
  Injector,
  ModuleWithProviders,
  NgModule,
  NgModuleFactoryLoader,
  Optional,
  SkipSelf,
  SystemJsNgModuleLoaderConfig
} from '@angular/core';
import {Router, Routes} from '@angular/router';
import {Location} from '@angular/common';

import {TranslateService} from '@ngx-translate/core';

import {
  ALWAYS_SET_PREFIX,
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

import {AVAILABLE_LANGUAGES} from '../service/i18n.service';

function createLocalizeParser(translate: TranslateService,
                              location: Location,
                              settings: LocalizeRouterSettings) {
  return new ManualParserLoader(translate, location, settings, Array.from(AVAILABLE_LANGUAGES.keys()));
}

const DEFAULT_CONFIG: LocalizeRouterConfig = {
  parser: {
    provide: LocalizeParser,
    useFactory: createLocalizeParser,
    deps: [TranslateService, Location, LocalizeRouterSettings]
  }
};

@NgModule()
export class CustomLocalizeRouterModule extends LocalizeRouterModule {
  static forRoot(routes: Routes, config: LocalizeRouterConfig = DEFAULT_CONFIG): ModuleWithProviders<any> {
    return {
      ngModule: CustomLocalizeRouterModule,
      providers: [
        {
          provide: LOCALIZE_ROUTER_FORROOT_GUARD,
          useFactory: provideForRootGuard,
          deps: [[LocalizeRouterModule, new Optional(), new SkipSelf()]]
        },
        {provide: USE_CACHED_LANG, useValue: config.useCachedLang},
        {provide: ALWAYS_SET_PREFIX, useValue: config.alwaysSetPrefix},
        {provide: CACHE_NAME, useValue: config.cacheName},
        {provide: CACHE_MECHANISM, useValue: config.cacheMechanism},
        {provide: DEFAULT_LANG_FUNCTION, useValue: config.defaultLangFunction},
        {
          provide: LocalizeRouterSettings,
          deps: [USE_CACHED_LANG, ALWAYS_SET_PREFIX, CACHE_MECHANISM, CACHE_NAME, DEFAULT_LANG_FUNCTION]
        },
        config.parser || {provide: LocalizeParser, useClass: DummyLocalizeParser},
        {provide: RAW_ROUTES, multi: true, useValue: routes},
        {
          provide: LocalizeRouterService,
          deps: [LocalizeParser, LocalizeRouterSettings, Router]
        },
        {provide: ParserInitializer, deps: [Injector]},
        {
          provide: NgModuleFactoryLoader,
          useClass: LocalizeRouterConfigLoader,
          deps: [LocalizeParser, Compiler, SystemJsNgModuleLoaderConfig]
        },
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
