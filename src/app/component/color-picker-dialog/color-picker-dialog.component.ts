import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';

const DEFAULT_COLOR = '#e0e0e0';

@Component({
  selector: 'app-color-picker-dialog',
  templateUrl: './color-picker-dialog.component.html',
  styleUrls: ['./color-picker-dialog.component.styl']
})
export class ColorPickerDialogComponent implements OnInit {
  readonly COLORS = [
    '#e57373', '#f06292', '#ba68c8', '#9575cd', '#7986cb',
    '#64b5f6', '#4dd0e1', '#4db6ac', '#81c784', '#dce775',
    '#fff176', '#ffb74d', '#a1887f', '#e0e0e0', '#90a4ae'
  ];

  color = DEFAULT_COLOR;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ColorPickerDialogData,
    private dialogRef: MatDialogRef<ColorPickerDialogComponent>
  ) {}

  ngOnInit() {
  }

  onCancelButtonClick(): void {
    this.dialogRef.close(false);
  }

  onOkButtonClick(): void {
    this.dialogRef.close(true);
  }
}

export interface ColorPickerDialogData {
  title: string;
  content: string;
}
