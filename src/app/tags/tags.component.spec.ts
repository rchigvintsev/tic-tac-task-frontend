import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {TagsComponent} from './tags.component';
import {ComponentTestSupport} from '../test/component-test-support';

describe('TagsComponent', () => {
  let component: TagsComponent;
  let fixture: ComponentFixture<TagsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: ComponentTestSupport.IMPORTS,
      declarations: ComponentTestSupport.DECLARATIONS
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
