import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {HttpClient} from '@angular/common/http';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {FormsModule} from '@angular/forms';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';

import {TranslateLoader, TranslateModule} from '@ngx-translate/core';

import {TranslateHttpLoaderFactory} from '../../app.module';
import {NotFoundComponent} from './not-found.component';
import {DashboardComponent} from '../../dashboard/dashboard.component';
import {TaskDetailComponent} from '../../task-detail/task-detail.component';
import {SigninComponent} from '../../signin/signin.component';
import {DummyComponent} from '../../dummy/dummy.component';
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
        })
      ],
      declarations: [
        NotFoundComponent,
        DashboardComponent,
        TaskDetailComponent,
        SigninComponent,
        DummyComponent
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
