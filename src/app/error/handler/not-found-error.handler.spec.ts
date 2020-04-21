import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {getTestBed, TestBed} from '@angular/core/testing';
import {Router} from '@angular/router';
import {RouterTestingModule} from '@angular/router/testing';
import {HttpClient} from '@angular/common/http';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {FormsModule} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';

import {TranslateLoader, TranslateModule, TranslateService} from '@ngx-translate/core';
import {NgxMatDatetimePickerModule} from 'ngx-mat-datetime-picker';

import {routes} from '../../app-routing.module';
import {TranslateHttpLoaderFactory} from '../../app.module';
import {NotFoundComponent} from '../not-found/not-found.component';
import {DummyComponent} from '../../dummy/dummy.component';
import {SigninComponent} from '../../signin/signin.component';
import {TasksComponent} from '../../tasks/tasks.component';
import {TaskDetailComponent} from '../../task-detail/task-detail.component';
import {NotFoundErrorHandler} from './not-found-error.handler';
import {LocalizedRelativeDatePipe} from '../../pipe/localized-relative-date.pipe';

describe('NotFoundErrorHandler', () => {
  let injector: TestBed;
  let router;
  let handler;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        HttpClientTestingModule,
        RouterTestingModule.withRoutes(routes),
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: TranslateHttpLoaderFactory,
            deps: [HttpClient]
          }
        }),
        MatInputModule,
        NgxMatDatetimePickerModule
      ],
      declarations: [
        TasksComponent,
        TaskDetailComponent,
        SigninComponent,
        DummyComponent,
        NotFoundComponent,
        LocalizedRelativeDatePipe
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    injector = getTestBed();

    router = injector.get(Router);
    router.navigate = jasmine.createSpy('navigate').and.callFake(() => Promise.resolve());

    const translateService = injector.get(TranslateService);
    translateService.currentLang = 'en';

    handler = injector.get(NotFoundErrorHandler);
  });

  it('should navigate to 404 error page when response status is "404 Not found"', () => {
    return handler.handle(null).subscribe(() => {
      expect(router.navigate).toHaveBeenCalledWith(['en', 'error', '404']);
    });
  });

  it('should support only not "404 Not found" error', () => {
    expect(handler.supports({status: 500})).toBeFalsy();
  });
});
