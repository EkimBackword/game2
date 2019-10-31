import { Component, OnInit, Inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material';

export interface IUiSnackData {
  title: string;
  message: string;
  type: MessageDataType;
}

export declare type MessageDataType = 'success' | 'warn' | 'error' | 'info';

@Component({
  selector: 'app-ui-snack',
  templateUrl: './ui-snack.component.html',
  styleUrls: ['./ui-snack.component.scss']
})
export class UiSnackComponent implements OnInit {

  constructor(
    public snackBarRef: MatSnackBarRef<UiSnackComponent>,
    @Inject(MAT_SNACK_BAR_DATA) public data: IUiSnackData
  ) { }

  ngOnInit() {
  }

}
