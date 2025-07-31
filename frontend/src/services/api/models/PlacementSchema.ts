/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Defines where the ads will be shown.
 */
export type PlacementSchema = {
    /**
     * Whether to use automatic placements.
     */
    automatic?: boolean;
    /**
     * Specific Instagram placements like 'stream', 'story', 'explore'.
     */
    instagram_positions?: (Array<string> | null);
    /**
     * Specific TikTok placements like 'feed', 'topbuzz'.
     */
    tiktok_placements?: (Array<string> | null);
};

