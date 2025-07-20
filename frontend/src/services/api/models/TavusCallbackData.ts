/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Tavus callback data model based on Tavus API documentation
 */
export type TavusCallbackData = {
    conversation_id: string;
    status: string;
    metadata?: Record<string, any>;
    transcript?: (string | null);
    recorded_at?: (string | null);
    duration_seconds?: (number | null);
    completion_url?: (string | null);
    conversation_name?: (string | null);
    persona_id?: (string | null);
    replica_id?: (string | null);
};

