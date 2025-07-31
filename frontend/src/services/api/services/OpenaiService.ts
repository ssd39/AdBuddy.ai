/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { RealtimeSessionRequest } from '../models/RealtimeSessionRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class OpenaiService {
    /**
     * Create Realtime Session
     * Create a session for the OpenAI real-time voice API
     * @returns any Successful Response
     * @throws ApiError
     */
    public static createRealtimeSessionApiV1OpenaiRealtimeSessionsPost({
        requestBody,
    }: {
        requestBody: RealtimeSessionRequest,
    }): CancelablePromise<Record<string, any>> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/openai/realtime/sessions',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
