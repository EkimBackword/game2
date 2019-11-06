import { BrowserModule } from '@angular/platform-browser';
import { NgModule, LOCALE_ID } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { APP_CONFIG } from './app.config';
import {
  AuthInterceptor,
  AuthServiceConfig,
  ShareServicesModule,
  NoAuthGuard,
  AuthGuard
} from './share-services';

import { SocketIoModule } from 'ngx-socket-io';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { MatDialogModule, MAT_DIALOG_DEFAULT_OPTIONS } from '@angular/material';


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    ShareServicesModule,
    SocketIoModule,
    MatDialogModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production })
  ],
  providers: [
    { provide: AuthServiceConfig, useValue: APP_CONFIG.auth },
    { provide: LOCALE_ID, useValue: APP_CONFIG.localeValue },
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: MAT_DIALOG_DEFAULT_OPTIONS, useValue: APP_CONFIG.dialogOption },
    NoAuthGuard,
    AuthGuard
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
