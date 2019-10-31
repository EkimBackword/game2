import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { IGameEventAttackUserData, ITile, IUnit } from '../../../../share-services';

export interface IDialogAttackUserComponentData {
  data: IGameEventAttackUserData;
  tile: ITile;
}

@Component({
  templateUrl: './dialog-attack-user.component.html',
  styleUrls: ['./dialog-attack-user.component.scss']
})
export class DialogAttackUserComponent implements OnInit {

  units: IUnit[] = [];
  army: IUnit[] = [];

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
