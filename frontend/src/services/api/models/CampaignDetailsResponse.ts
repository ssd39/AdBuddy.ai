/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AdCampaignSchema } from './AdCampaignSchema';
import type { CreativeIdeaSchema } from './CreativeIdeaSchema';
import type { TodoItemSchema } from './TodoItemSchema';
/**
 * Complete response model for the campaign details endpoint
 */
export type CampaignDetailsResponse = {
    id: string;
    title: string;
    status: string;
    created_at: string;
    updated_at?: (string | null);
    ad_campaign?: (AdCampaignSchema | null);
    campaign_goal?: (string | null);
    target_audience_analysis?: (string | null);
    creative_ideas?: (Array<CreativeIdeaSchema> | null);
    todo_list?: (Array<TodoItemSchema> | null);
    kpis?: (Array<string> | null);
    budget_allocation_strategy?: (string | null);
};

