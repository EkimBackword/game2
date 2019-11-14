import { environment } from 'src/environments/environment';
import { AuthServiceConfig } from './share-services/auth/auth.types';
import { MatDialogConfig } from '@angular/material';

// Структура конфигурации приложения
export interface IAppConfig {
    // Running mode
    production: boolean;

    // Версия приложения
    appVersion: string;
    appVersionFull: string;

    // Префикс API, описывает текущую используемую версию
    auth: AuthServiceConfig;
    dialogOption: MatDialogConfig;

    // Дефолтовый язык интерфейса
    language?: string;
    localeValue: string;
    dateLocaleValue: string;
}

export const APP_CONFIG: IAppConfig = {
    production: environment.production,
    appVersion: environment.version,
    appVersionFull: environment.versionFull,
    auth: {
      defaultUnauthorizedUrn: '/auth',
      defaultAuthorizedUrn: '/app',
      authCheckTimeout: 15000,
    },
    dialogOption: {
      maxHeight: '100vh',
      maxWidth: '100vw',
      width: '650px',
      panelClass: 'full-screen-modal',
    },
    language: 'rus',
    localeValue: 'ru',
    dateLocaleValue: 'ru-RU'
};
