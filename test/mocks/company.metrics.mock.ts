jest.mock("../../src/services/company.metrics.service");

import { Resource } from "@companieshouse/api-sdk-node";
import { MetricsApi } from "@companieshouse/api-sdk-node/dist/services/company-metrics/types";

export const companyMetrics: MetricsApi = {
    etag: 'f1a8fc38b37757060cec7ad34e0ed4dbf730346d',
    counts: {
        appointments: {
            activeDirectorsCount: 6,
            activeSecretariesCount: 1,
            activeCount: 7,
            resignedCount: 42,
            totalCount: 49,
            activeLlpMembersCount: 0
        }
    },
    mortgage: { 
        satisfiedCount: 133, 
        partSatisfiedCount: 0, 
        totalCount: 817 }
};

export const companyMetricsNoDirectors: MetricsApi = {
    etag: 'f1a8fc38b37757060cec7ad34e0ed4dbf730346d',
    counts: {
        appointments: {
            activeDirectorsCount: 0,
            activeSecretariesCount: 0,
            activeCount: 0,
            resignedCount: 0,
            totalCount: 0,
            activeLlpMembersCount: 0
        }
    },
    mortgage: { 
        satisfiedCount: 133, 
        partSatisfiedCount: 0, 
        totalCount: 817 }
};

export const companyMetricsResource: Resource<MetricsApi> = {
    httpStatusCode: 200,
    resource: companyMetrics,
};

export const companyMetricsNoDirectorsResource: Resource<MetricsApi> = {
    httpStatusCode: 200,
    resource: companyMetricsNoDirectors,
};