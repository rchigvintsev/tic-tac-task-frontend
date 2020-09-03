import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {TagsComponent} from './tags.component';
import {TestSupport} from '../test/test-support';

describe('TagsComponent', () => {
  let component: TagsComponent;
  let fixture: ComponentFixture<TagsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: TestSupport.IMPORTS,
      declarations: TestSupport.DECLARATIONS
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TagsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
