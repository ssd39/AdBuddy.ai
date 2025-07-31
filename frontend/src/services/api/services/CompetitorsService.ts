/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CompetitorAdsResponse } from '../models/CompetitorAdsResponse';
import type { CompetitorResponse } from '../models/CompetitorResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class CompetitorsService {
    /**
     * Test Qloo Service
     * Test endpoint for QlooService - does not require authentication
     * @returns any Successful Response
     * @throws ApiError
     */
    public static testQlooServiceApiV1CompetitorsTestGet(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/competitors/test',
        });
    }
    /**
     * Get Similar Companies
     * Get similar companies based on the pre-stored competitors data from onboarding
     * @returns CompetitorResponse Successful Response
     * @throws ApiError
     */
    public static getSimilarCompaniesApiV1CompetitorsSimilarCompaniesGet({
        page = 1,
        pageSize = 9,
    }: {
        page?: number,
        pageSize?: number,
    }): CancelablePromise<CompetitorResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/competitors/similar-companies',
            query: {
                'page': page,
                'page_size': pageSize,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Competitor Ads
     * Get ads from a specific competitor by company name
     * @returns CompetitorAdsResponse Successful Response
     * @throws ApiError
     */
    public static getCompetitorAdsApiV1CompetitorsCompetitorAdsGet({
        companyName,
        limit = 20,
    }: {
        companyName: string,
        limit?: number,
    }): CancelablePromise<CompetitorAdsResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/competitors/competitor-ads',
            query: {
                'company_name': companyName,
                'limit': limit,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
