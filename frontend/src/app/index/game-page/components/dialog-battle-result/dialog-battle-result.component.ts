import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { IBattleResult, IGameUser, IGamer, IEffect } from '../../../../share-services';

export interface IDialogBattleResultComponentData {
  battle: IBattleResult;
  attackUser: IGamer;
  defenseUser: IGamer;
  effect: IEffect;
}

@Component({
  templateUrl: './dialog-battle-result.component.html',
  styleUrls: ['./dialog-battle-result.component.scss']
})
export class DialogBattleResultComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<DialogBattleResultComponent>,
    @Inject(MAT_DIALOG_DATA) public data: IDialogBattleResultComponentData,
  ) { }

  ngOnInit() {
  }

  public onCancel() {
    this.dialogRef.close();
  }

}
