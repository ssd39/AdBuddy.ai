/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ConversationResponse } from '../models/ConversationResponse';
import type { CreateConversationRequest } from '../models/CreateConversationRequest';
import type { TavusCallbackData } from '../models/TavusCallbackData';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class TavusService {
    /**
     * Create Conversation
     * Create a new Tavus conversation for video onboarding
     * @returns ConversationResponse Successful Response
     * @throws ApiError
     */
    public static createConversationApiV1TavusCreateConversationPost({
        requestBody,
    }: {
        requestBody: CreateConversationRequest,
    }): CancelablePromise<ConversationResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/tavus/create-conversation',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Tavus Callback
     * Webhook endpoint for Tavus conversation callbacks
     * @returns any Successful Response
     * @throws ApiError
     */
    public static tavusCallbackApiV1TavusCallbackPost({
        requestBody,
    }: {
        requestBody: TavusCallbackData,
    }): CancelablePromise<Record<string, any>> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/tavus/callback',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Process Transcript
     * Manually process a conversation transcript to extract company information.
     * This endpoint is for testing the transcript processing functionality.
     * @returns any Successful Response
     * @throws ApiError
     */
    public static processTranscriptApiV1TavusProcessTranscriptConversationIdPost({
        conversationId,
    }: {
        conversationId: string,
    }): CancelablePromise<Record<string, any>> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/tavus/process-transcript/{conversation_id}',
            path: {
                'conversation_id': conversationId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Conversation Status
     * Get the status of a Tavus conversation
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getConversationStatusApiV1TavusConversationStatusConversationIdGet({
        conversationId,
    }: {
        conversationId: string,
    }): CancelablePromise<Record<string, any>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/tavus/conversation-status/{conversation_id}',
            path: {
                'conversation_id': conversationId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
