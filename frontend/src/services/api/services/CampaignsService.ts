/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CampaignDetailsResponse } from '../models/CampaignDetailsResponse';
import type { CampaignStatusResponse } from '../models/CampaignStatusResponse';
import type { CreateCampaignRequest } from '../models/CreateCampaignRequest';
import type { CreateCampaignResponse } from '../models/CreateCampaignResponse';
import type { ListCampaignsResponse } from '../models/ListCampaignsResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class CampaignsService {
    /**
     * Create Campaign
     * Create a new campaign with transcript data from the conversation.
     * Sets initial status as 'processing'.
     * @returns CreateCampaignResponse Successful Response
     * @throws ApiError
     */
    public static createCampaignApiV1CampaignsCreatePost({
        requestBody,
    }: {
        requestBody: CreateCampaignRequest,
    }): CancelablePromise<CreateCampaignResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/campaigns/create',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Campaign Status
     * Get the current status of a campaign by ID.
     * @returns CampaignStatusResponse Successful Response
     * @throws ApiError
     */
    public static getCampaignStatusApiV1CampaignsStatusCampaignIdGet({
        campaignId,
    }: {
        campaignId: string,
    }): CancelablePromise<CampaignStatusResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/campaigns/status/{campaign_id}',
            path: {
                'campaign_id': campaignId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Campaign Details
     * Get detailed information about a specific campaign by ID.
     * Includes all campaign data including audience analysis, creative ideas, etc.
     * @returns CampaignDetailsResponse Successful Response
     * @throws ApiError
     */
    public static getCampaignDetailsApiV1CampaignsDetailsCampaignIdGet({
        campaignId,
    }: {
        campaignId: string,
    }): CancelablePromise<CampaignDetailsResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/campaigns/details/{campaign_id}',
            path: {
                'campaign_id': campaignId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * List Campaigns
     * List all campaigns belonging to the current user.
     * @returns ListCampaignsResponse Successful Response
     * @throws ApiError
     */
    public static listCampaignsApiV1CampaignsListGet(): CancelablePromise<ListCampaignsResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/campaigns/list',
        });
    }
}
