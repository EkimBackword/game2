import { Component, OnInit, Inject } from '@angular/core';
import { IGameEventCastleUnitsChangeData, ITile, IUnit, IEffect } from '../../../../share-services';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

export interface IDialogCastleUnitsChangeComponentData {
  data: IGameEventCastleUnitsChangeData;
  tile: ITile;
  effect: IEffect;
}

@Component({
  templateUrl: './dialog-castle-units-change.component.html',
  styleUrls: ['./dialog-castle-units-change.component.scss']
})
export class DialogCastleUnitsChangeComponent implements OnInit {

  units: IUnit[] = [];
  army: IUnit[] = [];

  get power() {
        return this.units.reduce((prev, unit) => {
      const bonus: number = unit.type === this.data.effect.unitTypeBonus ? 1 : 0;
      return prev + unit.power + bonus;
    }, 0);
  }

  constructor(
    public dialogRef: MatDialogRef<DialogCastleUnitsChangeComponent>,
    @Inject(MAT_DIALOG_DATA) public data: IDialogCastleUnitsChangeComponentData,
  ) { }

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

  get checkChange() {
    const data = this.data.data;
    const flag1 = JSON.stringify(data.army) === JSON.stringify(this.army);
    const flag2 = JSON.stringify(data.units) === JSON.stringify(this.units);
    return flag1 && flag2;
  }

}
