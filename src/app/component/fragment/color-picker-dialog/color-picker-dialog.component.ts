import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

import {ColorEvent} from 'ngx-color';

import {ColorPalette} from '../../../util/color-palette';

@Component({
  selector: 'app-color-picker-dialog',
  templateUrl: './color-picker-dialog.component.html',
  styleUrls: ['./color-picker-dialog.component.scss']
})
export class ColorPickerDialogComponent {
  readonly COLORS = [
    ColorPalette.COLOR_RED[500].hex, ColorPalette.COLOR_PINK[500].hex, ColorPalette.COLOR_PURPLE[500].hex,
    ColorPalette.COLOR_DEEP_PURPLE[500].hex, ColorPalette.COLOR_INDIGO[500].hex, ColorPalette.COLOR_BLUE[500].hex,
    ColorPalette.COLOR_CYAN[500].hex, ColorPalette.COLOR_TEAL[500].hex, ColorPalette.COLOR_GREEN[500].hex,
    ColorPalette.COLOR_LIME[500].hex, ColorPalette.COLOR_YELLOW[500].hex, ColorPalette.COLOR_ORANGE[500].hex,
    ColorPalette.COLOR_DEEP_ORANGE[500].hex, ColorPalette.COLOR_BROWN[500].hex, ColorPalette.COLOR_GREY[500].hex
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
