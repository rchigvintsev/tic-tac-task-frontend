import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {Location} from '@angular/common';

import {TranslateService} from '@ngx-translate/core';

import {LocalizeParser, LocalizeRouterModule, LocalizeRouterSettings} from 'localize-router';
import {LocalizeRouterHttpLoader} from 'localize-router-http-loader';

import {DashboardComponent} from './dashboard/dashboard.component';

const routes: Routes = [
  {path: '', component: DashboardComponent},
];

export function LocalizeHttpLoaderFactory(translate: TranslateService,
                                          location: Location,
                                          settings: LocalizeRouterSettings,
                                          http: HttpClient) {
  return new LocalizeRouterHttpLoader(translate, location, settings, http);
}

@NgModule({
  imports: [
    LocalizeRouterModule.forRoot(routes, {
      parser: {
        provide: LocalizeParser,
        useFactory: LocalizeHttpLoaderFactory,
        deps: [TranslateService, Location, LocalizeRouterSettings, HttpClient]
      }
    }),
    RouterModule.forRoot(routes)
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
