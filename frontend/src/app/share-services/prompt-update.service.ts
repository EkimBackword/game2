import { Injectable } from '@angular/core';
import { SwUpdate, UpdateAvailableEvent } from '@angular/service-worker';
import { ConfirmDialogComponent, IConfirmDialogComponentData } from './confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material';

@Injectable({
  providedIn: 'root'
})
export class PromptUpdateService {

  constructor(
    private updates: SwUpdate,
    private dialog: MatDialog
  ) { }

  checkForUpdate() {
    console.log('checkForUpdate');
    if (this.updates.isEnabled) {
      console.log('isEnabled');
      this.updates.available.subscribe(async event => {
        const flag = await this.promptUser(event);
        if (flag) {
          this.updates.activateUpdate().then(() => document.location.reload());
        }
      });
    } else {
      console.log('Not isEnabled');
    }
  }

  private async promptUser(event: UpdateAvailableEvent) {
    const currentAppData: any = event.current.appData;
    const availableAppData: any = event.available.appData;
    const dialogData: IConfirmDialogComponentData = {
      title: 'Доступно новое обновление',
      text: `Ваша версия ${currentAppData.version}, новая версия ${availableAppData.version}. Обновить?`,
      actionOk: 'Обновить',
      actionCancel: 'Отмена'
    };
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxHeight: '100vh',
      maxWidth: '100vw',
      width: '650px',
      panelClass: 'full-screen-modal',
      data: dialogData
    });
    return await dialogRef.afterClosed().toPromise();
  }

}
