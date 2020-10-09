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
    spyOn(tagService, 'updateTag').and.callFake(t => of(t));
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
    component.onTagListItemMouseOver(component.tags[0]);
    const tagId = component.tags[0].id;
    const menuTriggerColumnSelector = By.css('.tag-' + tagId + ' .menu-trigger-column');
    fixture.whenStable().then(() => {
      component.onTagListItemMouseOut();
      fixture.detectChanges();
      expect(fixture.debugElement.query(menuTriggerColumnSelector).nativeElement.getAttribute('hidden')).toEqual('');
    });
  });

  it('should not hide tag menu trigger button on tag list item mouse out when tag menu is opened', () => {
    component.onTagListItemMouseOver(component.tags[0]);
    const tagId = component.tags[0].id;
    const menuTriggerColumnSelector = By.css('.tag-' + tagId + ' .menu-trigger-column');
    fixture.whenStable().then(() => {
      component.onTagMenuOpened();
      component.onTagListItemMouseOut();
      fixture.detectChanges();
      expect(fixture.debugElement.query(menuTriggerColumnSelector).nativeElement.getAttribute('hidden')).toBeNull();
    });
  });

  it('should hide tag menu trigger button on tag menu closed', () => {
    component.onTagListItemMouseOver(component.tags[0]);
    const tagId = component.tags[0].id;
    const menuTriggerColumnSelector = By.css('.tag-' + tagId + ' .menu-trigger-column');
    fixture.whenStable().then(() => {
      component.onTagMenuClosed();
      fixture.detectChanges();
      expect(fixture.debugElement.query(menuTriggerColumnSelector).nativeElement.getAttribute('hidden')).toEqual('');
    });
  });

  it('should stop event propagation on tag menu trigger button mouse down', () => {
    const event = createSpyObj(['stopPropagation']);
    component.onTagMenuTriggerButtonMouseDown(event);
    expect(event.stopPropagation).toHaveBeenCalled();
  });

  it('should show tag form on edit tag button click', () => {
    const tag = component.tags[0];
    fixture.whenStable().then(() => {
      component.onEditTagButtonClick(tag);
      fixture.detectChanges();
      const tagForm = fixture.debugElement.query(By.css(`#tag_list .tag-${tag.id} .tag-form`));
      expect(tagForm).toBeTruthy();
    });
  });

  it('should hide tag form on "cancelTagButton" click', () => {
    const tag = component.tags[0];
    fixture.whenStable().then(() => {
      component.tagFormModel = tag.clone();
      component.onCancelTagEditButtonClick();
      fixture.detectChanges();
      const tagForm = fixture.debugElement.query(By.css(`#tag_list .tag-${tag.id} .tag-form`));
      expect(tagForm).toBeFalsy();
    });
  });

  it('should hide tag name column on edit tag button click', () => {
    const tag = component.tags[0];
    fixture.whenStable().then(() => {
      component.onEditTagButtonClick(tag);
      fixture.detectChanges();
      const tagNameColumn = fixture.debugElement.query(By.css(`#tag_list .tag-${tag.id} .name-column`));
      expect(tagNameColumn).toBeFalsy();
    });
  });

  it('should save tag on "saveTagButton" click', () => {
    fixture.whenStable().then(() => {
      component.tagFormModel = component.tags[0].clone();
      component.tagFormModel.name = 'New tag';
      component.onSaveTagButtonClick();
      fixture.detectChanges();
      expect(tagService.updateTag).toHaveBeenCalled();
    });
  });

  it('should change tag color on color change complete', () => {
    fixture.whenStable().then(() => {
      component.tagFormModel = component.tags[0].clone();
      const colorEvent = {color: {hex: '#0000ff'}} as any;
      component.onColorChangeComplete(colorEvent);
      expect(component.tagFormModel.color).toEqual(colorEvent.color.hex);
    });
  });

  it('should not save tag with blank name on "saveTagButton" click', () => {
    fixture.whenStable().then(() => {
      component.tagFormModel = component.tags[0].clone();
      component.tagFormModel.name = ' ';
      component.onSaveTagButtonClick();
      fixture.detectChanges();
      expect(tagService.updateTag).not.toHaveBeenCalled();
    });
  });

  it('should throw error on "saveTagButton" click when tag model is not found by id', () => {
    fixture.whenStable().then(() => {
      component.tagFormModel = component.tags[0].clone();
      component.tagFormModel.id = -1;
      expect(() => component.onSaveTagButtonClick()).toThrow(new Error('Tag is not found by id -1'));
    });
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
