/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Defines the audience targeting for an ad set.
 */
export type TargetingSchema = {
    /**
     * List of targeted countries, regions, or cities.
     */
    locations?: (Array<string> | null);
    /**
     * Minimum age of the target audience.
     */
    age_min?: (number | null);
    /**
     * Maximum age of the target audience.
     */
    age_max?: (number | null);
    /**
     * Targeted genders (e.g., ['male', 'female']).
     */
    genders?: (Array<string> | null);
    /**
     * List of targeted language codes.
     */
    languages?: (Array<string> | null);
    /**
     * List of interests to target.
     */
    interests?: (Array<string> | null);
    /**
     * List of custom audience IDs.
     */
    custom_audiences?: (Array<string> | null);
};

