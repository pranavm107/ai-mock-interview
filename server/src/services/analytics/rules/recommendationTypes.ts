import { AnalyticsResponse } from '../../../types/analyticsResponse';

export type RuleContext = Omit<AnalyticsResponse, 'recommendations' | 'generatedAt'>;
