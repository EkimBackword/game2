import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { IGameEventAttackCastleData, ITile, IUnit, IEffect } from '../../../../share-services';

export interface IDialogAttackCastleComponentData {
  data: IGameEventAttackCastleData;
  tile: ITile;
  effect: IEffect;
}

@Component({
  templateUrl: './dialog-attack-castle.component.html',
  styleUrls: ['./dialog-attack-castle.component.scss']
})
export class DialogAttackCastleComponent implements OnInit {

  units: IUnit[] = [];
  army: IUnit[] = [];

  get power() {
    return this.units.reduce((prev, unit) => {
      const bonus: number = unit.type === this.data.effect.unitTypeBonus ? 1 : 0;
      return prev + unit.power + bonus;
    }, 0);
  }

  constructor(
    public dialogRef: MatDialogRef<DialogAttackCastleComponent>,
    @Inject(MAT_DIALOG_DATA) public data: IDialogAttackCastleComponentData,
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

}
