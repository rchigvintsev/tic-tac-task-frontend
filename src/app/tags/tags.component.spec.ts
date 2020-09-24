import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {MatDialog} from '@angular/material/dialog';
import {By} from '@angular/platform-browser';

import {of} from 'rxjs';

import {TagsComponent} from './tags.component';
import {TestSupport} from '../test/test-support';
import {ConfigService} from '../service/config.service';
import {TagService} from '../service/tag.service';
import {Tag} from '../model/tag';
import createSpyObj = jasmine.createSpyObj;

class MatDialogMock {
  open() {
    return {
      afterClosed: () => of(true)
    };
  }
}

describe('TagsComponent', () => {
  let component: TagsComponent;
  let fixture: ComponentFixture<TagsComponent>;
  let tagService: TagService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: TestSupport.IMPORTS,
      declarations: TestSupport.DECLARATIONS,
      providers: [
        {provide: MatDialog, useClass: MatDialogMock},
        {provide: ConfigService, useValue: {apiBaseUrl: 'http://backend.com'}}
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TagsComponent);

    tagService = fixture.debugElement.injector.get(TagService);
    const tags = [];
    for (let i = 0; i < 3; i++) {
      tags.push(new Tag().deserialize({id: i + 1, name: `Test tag ${i + 1}`}));
    }
    spyOn(tagService, 'getTags').and.returnValue(of(tags));
    spyOn(tagService, 'deleteTag').and.returnValue(of(null));

    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show tag menu trigger button on tag list item mouse over', () => {
    const tagId = component.tags[0].id;
    const menuTriggerColumnSelector = By.css('.tag-' + tagId + ' .menu-trigger-column');
    fixture.whenStable().then(() => {
      component.onTagListItemMouseOver(component.tags[0]);
      fixture.detectChanges();
      expect(fixture.debugElement.query(menuTriggerColumnSelector).nativeElement.getAttribute('hidden')).toBeNull();
    });
  });

  it('should hide tag menu trigger button on tag list item mouse out', () => {
    const tagId = component.tags[0].id;
    const menuTriggerColumnSelector = By.css('.tag-' + tagId + ' .menu-trigger-column');
    fixture.whenStable().then(() => {
      component.onTagListItemMouseOut(component.tags[0]);
      fixture.detectChanges();
      expect(fixture.debugElement.query(menuTriggerColumnSelector).nativeElement.getAttribute('hidden')).toEqual('');
    });
  });

  it('should not hide tag menu trigger button on tag list item mouse out when tag menu is opened', () => {
    const tagId = component.tags[0].id;
    const menuTriggerColumnSelector = By.css('.tag-' + tagId + ' .menu-trigger-column');
    fixture.whenStable().then(() => {
      component.onTagMenuOpened(component.tags[0]);
      component.onTagListItemMouseOut(component.tags[0]);
      fixture.detectChanges();
      expect(fixture.debugElement.query(menuTriggerColumnSelector).nativeElement.getAttribute('hidden')).toBeNull();
    });
  });

  it('should hide tag menu trigger button on tag menu closed', () => {
    const tagId = component.tags[0].id;
    const menuTriggerColumnSelector = By.css('.tag-' + tagId + ' .menu-trigger-column');
    fixture.whenStable().then(() => {
      component.onTagMenuClosed(component.tags[0]);
      fixture.detectChanges();
      expect(fixture.debugElement.query(menuTriggerColumnSelector).nativeElement.getAttribute('hidden')).toEqual('');
    });
  });

  it('should stop event propagation on tag menu trigger button mouse down', () => {
    const event = createSpyObj(['stopPropagation']);
    component.onTagMenuTriggerButtonMouseDown(event);
    expect(event.stopPropagation).toHaveBeenCalled();
  });

  it('should delete tag', () => {
    fixture.whenStable().then(() => {
      const tagToDelete = component.tags[0];
      component.onDeleteTagButtonClick(tagToDelete);
      fixture.detectChanges();
      expect(component.tags.length).toBe(2);
      expect(component.tags[0]).not.toEqual(tagToDelete);
    });
  });
});
