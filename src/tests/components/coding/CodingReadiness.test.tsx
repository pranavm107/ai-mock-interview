// @vitest-environment jsdom
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { CodingReadiness } from '../../../components/coding/CodingReadiness';
import { codingFrontendService } from '../../../services/codingFrontendService';

// Mock Clerk
vi.mock('@clerk/clerk-react', () => ({
  useAuth: () => ({
    getToken: vi.fn().mockResolvedValue('mock-token'),
  }),
}));

// Mock coding service
vi.mock('../../../services/codingFrontendService', () => ({
  codingFrontendService: {
    getReadinessData: vi.fn(),
  }
}));

describe('CodingReadiness Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    vi.mocked(codingFrontendService.getReadinessData).mockImplementation(() => new Promise(() => {}));
    const { container } = render(<CodingReadiness />);
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('renders error state if api fails', async () => {
    vi.mocked(codingFrontendService.getReadinessData).mockRejectedValue(new Error('Network error'));
    render(<CodingReadiness />);
    await waitFor(() => {
      expect(screen.getByText('Unable to load readiness assessment at this time.')).toBeInTheDocument();
    });
  });

  it('renders readiness score and recommendations', async () => {
    vi.mocked(codingFrontendService.getReadinessData).mockResolvedValue({
      score: 85,
      level: 'Interview Ready',
      recommendation: 'You are doing great!',
      strengths: ['Algorithms', 'Data Structures'],
      improvementAreas: ['System Design'],
      factors: {
        successScore: 20,
        difficultyScore: 20,
        topicScore: 20,
        consistencyScore: 20
      },
      isNewUser: false
    });

    render(<CodingReadiness />);

    await waitFor(() => {
      expect(screen.getByText('85')).toBeInTheDocument();
      expect(screen.getByText('Interview Ready')).toBeInTheDocument();
      expect(screen.getByText('You are doing great!')).toBeInTheDocument();
      expect(screen.getByText('Algorithms')).toBeInTheDocument();
      expect(screen.getByText('Data Structures')).toBeInTheDocument();
      expect(screen.getByText('System Design')).toBeInTheDocument();
    });
  });
});
