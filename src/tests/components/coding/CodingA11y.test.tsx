// @vitest-environment jsdom
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi } from 'vitest';
import { CodingAnalytics } from '../../../components/coding/CodingAnalytics';
import { CodingReadiness } from '../../../components/coding/CodingReadiness';

// Mock Clerk and Services
vi.mock('@clerk/clerk-react', () => ({
  useAuth: () => ({ getToken: vi.fn().mockResolvedValue('token') })
}));

vi.mock('../../../services/codingFrontendService', () => ({
  codingFrontendService: {
    getAnalyticsData: vi.fn(() => new Promise(() => {})), // Stay loading
    getReadinessData: vi.fn(() => new Promise(() => {}))
  }
}));

describe('A11y Tests - Coding Modules', () => {
  it('should render accessible loading states for CodingReadiness', () => {
    render(<CodingReadiness />);
    const loadingEl = screen.getByLabelText('Loading readiness assessment');
    expect(loadingEl).toBeInTheDocument();
    expect(loadingEl).toHaveAttribute('aria-busy', 'true');
  });

  it('should render accessible loading states for CodingAnalytics', () => {
    render(<CodingAnalytics />);
    const loadingEl = screen.getByLabelText('Loading analytics');
    expect(loadingEl).toBeInTheDocument();
    expect(loadingEl).toHaveAttribute('aria-busy', 'true');
  });
});
