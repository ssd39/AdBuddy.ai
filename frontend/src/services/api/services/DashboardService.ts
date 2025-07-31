/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DashboardStats } from '../models/DashboardStats';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class DashboardService {
    /**
     * Get Dashboard Stats
     * Get dashboard statistics including:
     * - Number of campaigns
     * - Number of competitors found
     * - Company details
     * @returns DashboardStats Successful Response
     * @throws ApiError
     */
    public static getDashboardStatsApiV1DashboardStatsGet(): CancelablePromise<DashboardStats> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/dashboard/stats',
        });
    }
}
