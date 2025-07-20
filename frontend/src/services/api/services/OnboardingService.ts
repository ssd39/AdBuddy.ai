/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { OnboardingData } from '../models/OnboardingData';
import type { UpdateOnboardingStateRequest } from '../models/UpdateOnboardingStateRequest';
import type { User } from '../models/User';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class OnboardingService {
    /**
     * Get Onboarding Status
     * Get user's onboarding status
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getOnboardingStatusApiV1OnboardingStatusGet(): CancelablePromise<Record<string, any>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/onboarding/status',
        });
    }
    /**
     * Complete Onboarding
     * Complete user onboarding process
     * @returns User Successful Response
     * @throws ApiError
     */
    public static completeOnboardingApiV1OnboardingCompletePost({
        requestBody,
    }: {
        requestBody: OnboardingData,
    }): CancelablePromise<User> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/onboarding/complete',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update Onboarding State
     * Update user's onboarding state
     * @returns any Successful Response
     * @throws ApiError
     */
    public static updateOnboardingStateApiV1OnboardingStatePost({
        requestBody,
    }: {
        requestBody: UpdateOnboardingStateRequest,
    }): CancelablePromise<Record<string, any>> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/onboarding/state',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
