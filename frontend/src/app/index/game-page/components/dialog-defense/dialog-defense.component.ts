import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ITile, IUnit, IGameEventDefenseData, IEffect } from '../../../../share-services';


export interface IDialogDefenseComponentData {
  data: IGameEventDefenseData;
  tile: ITile;
  effect: IEffect;
}

@Component({
  templateUrl: './dialog-defense.component.html',
  styleUrls: ['./dialog-defense.component.scss']
})
export class DialogDefenseComponent implements OnInit {

  units: IUnit[] = [];
  army: IUnit[] = [];

  constructor(
    public dialogRef: MatDialogRef<DialogDefenseComponent>,
    @Inject(MAT_DIALOG_DATA) public data: IDialogDefenseComponentData,
  ) { }

  ngOnInit() {
    this.army = JSON.parse(JSON.stringify(this.data.data.army));
    this.units = JSON.parse(JSON.stringify(this.data.data.units));
  }

  get power() {
        return this.units.reduce((prev, unit) => {
      const bonus: number = unit.type === this.data.effect.unitTypeBonus ? 1 : 0;
      return prev + unit.power + bonus;
    }, 0);
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

  get check() {
    const data = this.data.data;
    return data.army.length > 0 && this.units.length === 0;
  }

}
