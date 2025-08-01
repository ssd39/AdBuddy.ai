/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AppSettings } from '../models/AppSettings';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class SettingsService {
    /**
     * Get App Settings
     * Get global application settings
     * @returns AppSettings Successful Response
     * @throws ApiError
     */
    public static getAppSettingsApiV1SettingsSettingsGet(): CancelablePromise<AppSettings> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/settings/settings',
        });
    }
    /**
     * Set App Settings
     * Set global application settings
     * @returns AppSettings Successful Response
     * @throws ApiError
     */
    public static setAppSettingsApiV1SettingsSettingsPost({
        requestBody,
    }: {
        requestBody: AppSettings,
    }): CancelablePromise<AppSettings> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/settings/settings',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
