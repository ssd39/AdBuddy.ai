/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { OnboardingRequest } from '../models/OnboardingRequest';
import type { OTPVerify } from '../models/OTPVerify';
import type { Token } from '../models/Token';
import type { User } from '../models/User';
import type { UserCreate } from '../models/UserCreate';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AuthService {
    /**
     * Login Send Otp
     * Send an OTP code to user's email
     * @returns any Successful Response
     * @throws ApiError
     */
    public static loginSendOtpApiV1AuthLoginOtpSendPost({
        requestBody,
    }: {
        requestBody: UserCreate,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/auth/login/otp/send',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Login Verify Otp
     * Verify OTP and get access token
     * @returns Token Successful Response
     * @throws ApiError
     */
    public static loginVerifyOtpApiV1AuthLoginOtpVerifyPost({
        requestBody,
    }: {
        requestBody: OTPVerify,
    }): CancelablePromise<Token> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/auth/login/otp/verify',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get User Me
     * Get current user information
     * @returns User Successful Response
     * @throws ApiError
     */
    public static getUserMeApiV1AuthMeGet(): CancelablePromise<User> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/auth/me',
        });
    }
    /**
     * Complete Onboarding
     * Complete user onboarding
     * @returns User Successful Response
     * @throws ApiError
     */
    public static completeOnboardingApiV1AuthOnboardingPost({
        requestBody,
    }: {
        requestBody: OnboardingRequest,
    }): CancelablePromise<User> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/auth/onboarding',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
