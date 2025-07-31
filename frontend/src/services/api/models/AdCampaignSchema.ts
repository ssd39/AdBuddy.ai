/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AdSetSchema } from './AdSetSchema';
import type { AdStatus } from './AdStatus';
import type { BudgetSchema } from './BudgetSchema';
import type { CampaignObjective } from './CampaignObjective';
/**
 * A comprehensive model for a social media ad campaign.
 */
export type AdCampaignSchema = {
    /**
     * The name of the ad campaign.
     */
    name: string;
    /**
     * The primary objective of the campaign.
     */
    objective: CampaignObjective;
    /**
     * The current status of the campaign.
     */
    status?: AdStatus;
    /**
     * A list of ad sets or ad groups belonging to this campaign.
     */
    ad_sets: Array<AdSetSchema>;
    /**
     * Campaign-level budget (Campaign Budget Optimization).
     */
    campaign_budget?: (BudgetSchema | null);
    /**
     * Special ad category for sensitive topics (e.g., 'HOUSING', 'EMPLOYMENT').
     */
    special_ad_category?: (string | null);
    /**
     * Dictionary of platform-specific account/page IDs.
     */
    platform_specific_ids?: (Record<string, string> | null);
};

