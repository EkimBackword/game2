/**
 * Конфигурация AuthService
 */
export class AuthServiceConfig {
    /**
     * Интервал проверки сессии авторизации в милисекундах
     * Если указано 0 - проверка отключается
     */
    authCheckTimeout: number;

    /**
     * Роут по умолчанию для авторизованных пользователей
     */
    defaultAuthorizedUrn: string;

    /**
     * Роут по умолчанию для неавторизованных пользователей
     */
    defaultUnauthorizedUrn: string;
}
