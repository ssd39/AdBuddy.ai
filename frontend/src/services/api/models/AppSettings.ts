/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type AppSettings = {
    id?: string;
    onboarding_provider?: AppSettings.onboarding_provider;
};
export namespace AppSettings {
    export enum onboarding_provider {
        TAVUS = 'tavus',
        OPENAI = 'openai',
    }
}

