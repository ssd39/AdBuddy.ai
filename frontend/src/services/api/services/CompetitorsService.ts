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
     * Get Similar Companies
     * Get similar companies based on the user's company details stored in user_metadata
     * @returns CompetitorResponse Successful Response
     * @throws ApiError
     */
    public static getSimilarCompaniesApiV1CompetitorsSimilarCompaniesGet({
        limit = 10,
    }: {
        limit?: number,
    }): CancelablePromise<CompetitorResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/competitors/similar-companies',
            query: {
                'limit': limit,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Competitor Ads
     * Get ads from competitors based on either specified company IDs or automatically found similar companies
     * @returns CompetitorAdsResponse Successful Response
     * @throws ApiError
     */
    public static getCompetitorAdsApiV1CompetitorsCompetitorAdsGet({
        limit = 20,
        adsPerCompetitor = 5,
        companyIds,
    }: {
        limit?: number,
        adsPerCompetitor?: number,
        companyIds?: (string | null),
    }): CancelablePromise<CompetitorAdsResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/competitors/competitor-ads',
            query: {
                'limit': limit,
                'ads_per_competitor': adsPerCompetitor,
                'company_ids': companyIds,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
