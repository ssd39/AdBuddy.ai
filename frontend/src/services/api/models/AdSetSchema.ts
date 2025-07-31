/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AdStatus } from './AdStatus';
import type { BudgetSchema } from './BudgetSchema';
import type { CreativeSchema } from './CreativeSchema';
import type { PlacementSchema } from './PlacementSchema';
import type { TargetingSchema } from './TargetingSchema';
/**
 * Represents an ad set (Instagram) or ad group (TikTok).
 */
export type AdSetSchema = {
    /**
     * The name of the ad set or ad group.
     */
    name: string;
    /**
     * The status of the ad set.
     */
    status?: AdStatus;
    /**
     * The start time for the ad set.
     */
    start_time?: (string | null);
    /**
     * The end time for the ad set. Required for lifetime budgets.
     */
    end_time?: (string | null);
    /**
     * The budget for this ad set.
     */
    budget: BudgetSchema;
    /**
     * The targeting criteria for this ad set.
     */
    targeting: TargetingSchema;
    /**
     * The placements for the ads in this set.
     */
    placements: PlacementSchema;
    /**
     * The optimization goal for the ad set (e.g., 'REACH', 'CONVERSIONS').
     */
    optimization_goal: string;
    /**
     * A list of creatives to be used in this ad set.
     */
    creatives: Array<CreativeSchema>;
};

