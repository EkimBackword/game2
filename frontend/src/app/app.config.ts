import { environment } from 'src/environments/environment';
import { AuthServiceConfig } from './share-services/auth/auth.types';

// Структура конфигурации приложения
export interface IAppConfig {
    // Running mode
    production: boolean;

    // Версия приложения
    appVersion: string;

    // Префикс API, описывает текущую используемую версию
    auth: AuthServiceConfig;

    // Дефолтовый язык интерфейса
    language?: string;
    localeValue: string;
    dateLocaleValue: string;
}

export const APP_CONFIG: IAppConfig = {
    production: environment.production,
    appVersion: environment.version,
    auth: {
      defaultUnauthorizedUrn: '/auth',
      defaultAuthorizedUrn: '/app',
      authCheckTimeout: 15000,
    },
    language: 'rus',
    localeValue: 'ru',
    dateLocaleValue: 'ru-RU'
};
