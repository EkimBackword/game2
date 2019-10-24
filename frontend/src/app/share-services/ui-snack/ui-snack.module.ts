import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UiSnackComponent } from './ui-snack.component';
import { MatSnackBarModule } from '@angular/material';


@NgModule({
  declarations: [
    UiSnackComponent
  ],
  entryComponents: [
    UiSnackComponent
  ],
  imports: [
    CommonModule,
    MatSnackBarModule
  ],
  exports: [
    UiSnackComponent,
    MatSnackBarModule
  ]
})
export class UiSnackModule { }
