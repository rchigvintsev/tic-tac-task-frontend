import {async, ComponentFixture, getTestBed, TestBed} from '@angular/core/testing';
import {NavigationEnd, Router, RouterEvent} from '@angular/router';
import {By} from '@angular/platform-browser';

import {of, Subject} from 'rxjs';

import {TagsComponent} from './tags.component';
import {TestSupport} from '../../../test/test-support';
import {ConfigService} from '../../../service/config.service';
import {TagService} from '../../../service/tag.service';
import {Tag} from '../../../model/tag';

describe('TagsComponent', () => {
  let component: TagsComponent;
  let fixture: ComponentFixture<TagsComponent>;
  let tagService: TagService;
  let createdTagSource: Subject<Tag>;
  let routerEvents: Subject<RouterEvent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: TestSupport.IMPORTS,
      declarations: TestSupport.DECLARATIONS,
      providers: [{provide: ConfigService, useValue: {apiBaseUrl: 'http://backend.com'}}]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TagsComponent);
    const injector = getTestBed();

    tagService = injector.get(TagService);
    const tags = [];
    for (let i = 0; i < 3; i++) {
      tags.push(new Tag().deserialize({id: i + 1, name: `Test tag ${i + 1}`}));
    }
    spyOn(tagService, 'getTags').and.returnValue(of(tags));

    createdTagSource = new Subject<Tag>();
    spyOn(tagService, 'getCreatedTag').and.returnValue(createdTagSource.asObservable());

    routerEvents = new Subject();
    const router = injector.get(Router);
    (router as any).events = routerEvents.asObservable();

    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should highlight selected menu item', () => {
    routerEvents.next(new NavigationEnd(1, '/en/tag/1', null));
    fixture.whenStable().then(() => {
      fixture.detectChanges();
      const selectedItem = fixture.debugElement.query(By.css('.mat-list .mat-list-item-selected.tag-1'));
      expect(selectedItem).toBeTruthy();
    });
  });

  it('should update tag list on tag create', () => {
    fixture.whenStable().then(() => {
      const newTag = new Tag('New tag');
      createdTagSource.next(newTag);
      fixture.detectChanges();
      expect(component.tags.length).toBe(4);
      expect(component.tags[3]).toEqual(newTag);
    });
  });
});
