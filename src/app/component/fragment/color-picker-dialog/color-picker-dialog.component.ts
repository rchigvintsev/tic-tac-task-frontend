import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

import {ColorEvent} from 'ngx-color';

@Component({
  selector: 'app-color-picker-dialog',
  templateUrl: './color-picker-dialog.component.html',
  styleUrls: ['./color-picker-dialog.component.scss']
})
export class ColorPickerDialogComponent {
  readonly COLORS = [
    '#e57373', '#f06292', '#ba68c8', '#9575cd', '#7986cb',
    '#64b5f6', '#4dd0e1', '#4db6ac', '#81c784', '#dce775',
    '#fff176', '#ffb74d', '#a1887f', '#e0e0e0', '#90a4ae'
  ];

  color: string;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ColorPickerDialogData,
    private dialogRef: MatDialogRef<ColorPickerDialogComponent>
  ) {
    this.color = data.color || '';
  }

  onColorChangeComplete(e: ColorEvent) {
    this.color = e.color.hex;
  }

  onCancelButtonClick(): void {
    this.dialogRef.close({result: false});
  }

  onOkButtonClick(): void {
    this.dialogRef.close({result: true, color: this.color});
  }
}

export interface ColorPickerDialogData {
  title: string;
  color: string;
}
