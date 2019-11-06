import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UiSnackModule } from './ui-snack';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';

@NgModule({
  imports: [
    CommonModule,
    UiSnackModule
  ],
  declarations: [ConfirmDialogComponent],
  entryComponents: [ConfirmDialogComponent],
})
export class ShareServicesModule { }
