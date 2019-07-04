import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';

@Component({
  selector: 'app-confirmation-dialog',
  templateUrl: './confirmation-dialog.component.html',
  styleUrls: ['./confirmation-dialog.component.styl']
})
export class ConfirmationDialogComponent implements OnInit {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ConfirmationDialogData,
    private dialogRef: MatDialogRef<ConfirmationDialogComponent>
  ) {}

  ngOnInit() {
  }

  onNoButtonClick(): void {
    this.dialogRef.close(false);
  }

  onYesButtonClick(): void {
    this.dialogRef.close(true);
  }
}

export interface ConfirmationDialogData {
  title: string;
  content: string;
}
