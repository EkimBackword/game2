import { Injectable } from '@angular/core';
import { MatSnackBarConfig, MatSnackBar } from '@angular/material';
import { IUiSnackData, UiSnackComponent } from './ui-snack.component';

@Injectable({
  providedIn: 'root'
})
export class UiSnackService {

  protected defaultConfig: MatSnackBarConfig;

  constructor(protected snackBar: MatSnackBar) {
    this.defaultConfig = {
      duration: 1000,
      panelClass: ['snack-bar--no-padding'],
      horizontalPosition: 'left',
      verticalPosition: 'top'
    };
  }

  showMessage(data: IUiSnackData, options?: MatSnackBarConfig) {
    const config = Object.assign({}, this.defaultConfig, options, { data });
    return this.snackBar.openFromComponent(UiSnackComponent, config);
  }

}
