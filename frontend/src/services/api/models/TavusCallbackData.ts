/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { TavusCallbackProperties } from './TavusCallbackProperties';
/**
 * Tavus callback data model based on Tavus webhooks documentation
 */
export type TavusCallbackData = {
    conversation_id: string;
    webhook_url: string;
    event_type: string;
    message_type: string;
    timestamp: string;
    properties?: (TavusCallbackProperties | null);
};

