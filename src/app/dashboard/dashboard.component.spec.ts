import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {HttpClient} from '@angular/common/http';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {FormsModule} from '@angular/forms';
import {RouterTestingModule} from '@angular/router/testing';

import {TranslateLoader, TranslateModule} from '@ngx-translate/core';

import {TranslateHttpLoaderFactory} from '../app.module';
import {routes} from '../app-routing.module';
import {NgxMatDatetimePickerModule} from 'ngx-mat-datetime-picker';

import {SigninComponent} from '../signin/signin.component';
import {DashboardComponent} from './dashboard.component';
import {TaskDetailComponent} from '../task-detail/task-detail.component';
import {NotFoundComponent} from '../error/not-found/not-found.component';
import {DummyComponent} from '../dummy/dummy.component';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;

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
        NgxMatDatetimePickerModule
      ],
      declarations: [SigninComponent, DashboardComponent, TaskDetailComponent, NotFoundComponent, DummyComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
