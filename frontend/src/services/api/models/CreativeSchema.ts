/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Represents the creative content of an ad.
 */
export type CreativeSchema = {
    /**
     * The format of the ad (e.g., 'IMAGE', 'VIDEO', 'CAROUSEL').
     */
    ad_format: string;
    /**
     * The main text or caption of the ad.
     */
    primary_text: string;
    /**
     * The headline of the ad.
     */
    headline?: (string | null);
    /**
     * A longer description for the ad.
     */
    description?: (string | null);
};

