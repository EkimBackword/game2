import { Injectable, ApplicationRef } from '@angular/core';
import { SwUpdate, UpdateAvailableEvent } from '@angular/service-worker';
import { ConfirmDialogComponent, IConfirmDialogComponentData } from './confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material';
import { concat, interval } from 'rxjs';
import { first } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PromptUpdateService {

  constructor(
    private updates: SwUpdate,
    private dialog: MatDialog,
    private appRef: ApplicationRef,
  ) {
    updates.activated.subscribe(event => {
      // console.log('old version was', event.previous);
      // console.log('new version is', event.current);
    });
  }

  checkForUpdate() {
    // console.log('checkForUpdate');
    if (this.updates.isEnabled) {
      // console.log('isEnabled');
      this.updates.available.subscribe(async event => {
        const flag = await this.promptUser(event);
        if (flag) {
          this.updates.activateUpdate().then(() => document.location.reload());
        }
      });
    } else {
      // console.log('Not isEnabled');
    }
  }

  pollingCheck() {
    // console.log('pollingCheck');
    // Allow the app to stabilize first, before starting polling for updates with `interval()`.
    const appIsStable$ = this.appRef.isStable.pipe(first(isStable => isStable === true));
    const everySixHours$ = interval(6 * 60 * 60 * 1000);
    const everySixHoursOnceAppIsStable$ = concat(appIsStable$, everySixHours$);

    everySixHoursOnceAppIsStable$.subscribe(() => this.updates.checkForUpdate());
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
      data: dialogData,
      disableClose: true
    });
    return await dialogRef.afterClosed().toPromise();
  }

}
