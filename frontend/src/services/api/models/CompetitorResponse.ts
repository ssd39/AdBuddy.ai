/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PaginationInfo } from './PaginationInfo';
/**
 * Response model for competitors data
 */
export type CompetitorResponse = {
    competitors: Array<Record<string, any>>;
    query_parameters: Record<string, any>;
    pagination: PaginationInfo;
    source?: string;
};

