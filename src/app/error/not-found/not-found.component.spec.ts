import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {HttpClient} from '@angular/common/http';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {FormsModule} from '@angular/forms';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {MatInputModule} from '@angular/material/input';

import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {NgxMatDatetimePickerModule} from 'ngx-mat-datetime-picker';

import {TranslateHttpLoaderFactory} from '../../app.module';
import {NotFoundComponent} from './not-found.component';
import {TasksComponent} from '../../tasks/tasks.component';
import {TaskDetailComponent} from '../../task-detail/task-detail.component';
import {SigninComponent} from '../../signin/signin.component';
import {DummyComponent} from '../../dummy/dummy.component';
import {LocalizedRelativeDatePipe} from '../../pipe/localized-relative-date.pipe';
import {routes} from '../../app-routing.module';

describe('NotFoundComponent', () => {
  let component: NotFoundComponent;
  let fixture: ComponentFixture<NotFoundComponent>;

  beforeEach(async(() => {
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
        NotFoundComponent,
        TasksComponent,
        TaskDetailComponent,
        SigninComponent,
        DummyComponent,
        LocalizedRelativeDatePipe
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NotFoundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
