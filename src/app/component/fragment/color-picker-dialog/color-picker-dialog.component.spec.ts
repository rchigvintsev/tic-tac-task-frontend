import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

import {ColorEvent} from 'ngx-color';

import {ColorPickerDialogComponent} from './color-picker-dialog.component';
import {TestSupport} from '../../../test/test-support';

class MatDialogRefMock {
  // noinspection JSUnusedGlobalSymbols
  close() {
  }
}

describe('ColorPickerDialogComponent', () => {
  let component: ColorPickerDialogComponent;
  let fixture: ComponentFixture<ColorPickerDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: TestSupport.IMPORTS,
      declarations: TestSupport.DECLARATIONS,
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        {provide: MatDialogRef, useClass: MatDialogRefMock},
        {provide: MAT_DIALOG_DATA, useValue: []}
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ColorPickerDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should save selected color on color change complete', () => {
    const colorEvent = {color: {hex: '#00ff00'}} as any;
    component.onColorChangeComplete(colorEvent as ColorEvent);
    expect(component.color).toEqual(colorEvent.color.hex);
  });

  it('should close dialog with positive result on "OK" button click', () => {
    const matDialogRef = fixture.debugElement.injector.get(MatDialogRef);
    spyOn(matDialogRef, 'close');
    component.onOkButtonClick();
    expect(matDialogRef.close).toHaveBeenCalledWith({result: true, color: component.color});
  });

  it('should close dialog with negative result "Cancel" button click', () => {
    const matDialogRef = fixture.debugElement.injector.get(MatDialogRef);
    spyOn(matDialogRef, 'close');
    component.onCancelButtonClick();
    expect(matDialogRef.close).toHaveBeenCalledWith({result: false});
  });
});
