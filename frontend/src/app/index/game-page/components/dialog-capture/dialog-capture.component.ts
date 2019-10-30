import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
  CdkDrag,
  CdkDropList,
} from '@angular/cdk/drag-drop';

import { IGameEventCaptureData, IUnit } from '../../../../share-services';

@Component({
  templateUrl: './dialog-capture.component.html',
  styleUrls: ['./dialog-capture.component.scss']
})
export class DialogCaptureComponent implements OnInit {

  units: IUnit[] = [];
  army: IUnit[] = [];

  constructor(
    public dialogRef: MatDialogRef<DialogCaptureComponent>,
    @Inject(MAT_DIALOG_DATA) public data: IGameEventCaptureData,
  ) {}

  ngOnInit() {
    this.army = JSON.parse(JSON.stringify(this.data.army));
    this.units = JSON.parse(JSON.stringify(this.data.units));
  }

  public onCancel() {
    this.dialogRef.close();
  }

  public async onSubmit() {
    this.data.army = JSON.parse(JSON.stringify(this.army));
    this.data.units = JSON.parse(JSON.stringify(this.units));
    this.dialogRef.close(this.data);
  }

}
