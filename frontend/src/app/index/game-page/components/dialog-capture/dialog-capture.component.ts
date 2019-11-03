import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { IGameEventCaptureData, IUnit, IEffect } from '../../../../share-services';

export interface IDialogCaptureComponentData {
  data: IGameEventCaptureData;
  effect: IEffect;
}

@Component({
  templateUrl: './dialog-capture.component.html',
  styleUrls: ['./dialog-capture.component.scss']
})
export class DialogCaptureComponent implements OnInit {

  units: IUnit[] = [];
  army: IUnit[] = [];

  get power() {
        return this.units.reduce((prev, unit) => {
      const bonus: number = unit.type === this.data.effect.unitTypeBonus ? 1 : 0;
      return prev + unit.power + bonus;
    }, 0);
  }

  constructor(
    public dialogRef: MatDialogRef<DialogCaptureComponent>,
    @Inject(MAT_DIALOG_DATA) public data: IDialogCaptureComponentData,
  ) {}

  ngOnInit() {
    this.army = JSON.parse(JSON.stringify(this.data.data.army));
    this.units = JSON.parse(JSON.stringify(this.data.data.units));
  }

  public onCancel() {
    this.dialogRef.close();
  }

  public async onSubmit() {
    const data = this.data.data;
    data.army = JSON.parse(JSON.stringify(this.army));
    data.units = JSON.parse(JSON.stringify(this.units));
    this.dialogRef.close(data);
  }

}
