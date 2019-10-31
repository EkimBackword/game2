import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ITile, IUnit, IGameEventDefenseData } from '../../../../share-services';


export interface IDialogDefenseComponentData {
  data: IGameEventDefenseData;
  tile: ITile;
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
