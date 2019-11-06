import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';


export interface IConfirmDialogComponentData {
  title: string;
  text: string;
  actionOk: string;
  actionCancel: string;
}

@Component({
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.scss']
})
export class ConfirmDialogComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: IConfirmDialogComponentData,
  ) { }

  ngOnInit() {
  }

  public onCancel() {
    this.dialogRef.close(false);
  }

  public async onSubmit() {
    this.dialogRef.close(true);
  }

}
