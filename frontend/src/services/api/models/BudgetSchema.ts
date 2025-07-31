/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BudgetMode } from './BudgetMode';
/**
 * Defines the budget for a campaign or ad set.
 */
export type BudgetSchema = {
    /**
     * The type of budget, e.g., daily or lifetime.
     */
    mode: BudgetMode;
    /**
     * The budget amount.
     */
    amount: number;
    /**
     * The ISO 4217 currency code.
     */
    currency?: string;
};

