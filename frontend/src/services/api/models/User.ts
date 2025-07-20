/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * User model
 */
export type User = {
    created_at?: (string | null);
    updated_at?: (string | null);
    id: string;
    email: string;
    is_active?: boolean;
    is_onboarded?: boolean;
    full_name?: (string | null);
    user_metadata?: (Record<string, any> | null);
};

