import {async, ComponentFixture, getTestBed, TestBed} from '@angular/core/testing';
import {ActivatedRoute, convertToParamMap} from '@angular/router';

import {of} from 'rxjs';

import {TestSupport} from '../../../test/test-support';
import {BaseSignComponent} from './base-sign.component';
import {ConfigService} from '../../../service/config.service';
import {Config} from '../../../model/config';

describe('BaseSignComponent', () => {
  let component: BaseSignComponent;
  let fixture: ComponentFixture<BaseSignComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: TestSupport.IMPORTS,
      declarations: TestSupport.DECLARATIONS,
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            queryParamMap: of(convertToParamMap({error: true}))
          }
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    const injector = getTestBed();

    const configService = injector.get(ConfigService);
    configService.setConfig(new Config());

    fixture = TestBed.createComponent(BaseSignComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
