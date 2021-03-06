import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { IGameEventAttackUserData, ITile, IUnit, IEffect } from '../../../../share-services';

export interface IDialogAttackUserComponentData {
  data: IGameEventAttackUserData;
  tile: ITile;
  effect: IEffect;
}

@Component({
  templateUrl: './dialog-attack-user.component.html',
  styleUrls: ['./dialog-attack-user.component.scss']
})
export class DialogAttackUserComponent implements OnInit {

  units: IUnit[] = [];
  army: IUnit[] = [];

  get power() {
        return this.units.reduce((prev, unit) => {
      const bonus: number = unit.type === this.data.effect.unitTypeBonus ? 1 : 0;
      return prev + unit.power + bonus;
    }, 0);
  }

  constructor(
    public dialogRef: MatDialogRef<DialogAttackUserComponent>,
    @Inject(MAT_DIALOG_DATA) public data: IDialogAttackUserComponentData,
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
