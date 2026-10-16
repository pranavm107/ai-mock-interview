// @vitest-environment jsdom
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import CodingDashboard from '../../pages/CodingDashboard';
import { codingFrontendService } from '../../services/codingFrontendService';

// Mock Clerk
vi.mock('@clerk/clerk-react', () => ({
  useAuth: () => ({
    getToken: vi.fn().mockResolvedValue('mock-token'),
  }),
}));

// Mock Router
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}));

// Mock child components
vi.mock('../../components/coding/CodingReadiness', () => ({
  CodingReadiness: () => <div data-testid="coding-readiness-mock">Coding Readiness</div>
}));

vi.mock('../../components/coding/CodingAnalytics', () => ({
  CodingAnalytics: () => <div data-testid="coding-analytics-mock">Coding Analytics</div>
}));

// Mock coding service
vi.mock('../../services/codingFrontendService', () => ({
  codingFrontendService: {
    getDashboardData: vi.fn(),
  }
}));

describe('CodingDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    // Delay resolution so we can see loading state
    vi.mocked(codingFrontendService.getDashboardData).mockImplementation(() => new Promise(() => {}));
    const { container } = render(<CodingDashboard />);
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('renders error state on failure', async () => {
    vi.mocked(codingFrontendService.getDashboardData).mockRejectedValue(new Error('API Error'));
    render(<CodingDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(screen.getByText("We couldn't load your coding practice. Please try again.")).toBeInTheDocument();
    });
  });

  it('renders dashboard data successfully', async () => {
    const mockData = {
      dailyAssignment: {
        id: '1',
        problemId: 'c23-easy-1',
        topic: 'Arrays',
        difficulty: 'EASY',
        reason: 'Recommended for you.',
        status: 'NOT_STARTED',
        dateKey: '2024-05-01',
        problem: {
          id: 'c23-easy-1',
          title: 'Two Sum',
          description: 'A classic array problem.',
          difficulty: 'EASY',
          estimatedMinutes: 15
        }
      },
      recentTasks: [],
      progress: {
        problemsAssigned: 1,
        problemsCompleted: 0,
        topicsPracticed: []
      }
    };

    vi.mocked(codingFrontendService.getDashboardData).mockResolvedValue(mockData as any);
    render(<CodingDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Coding Practice')).toBeInTheDocument();
      expect(screen.getByText("TODAY'S CHALLENGE")).toBeInTheDocument();
      expect(screen.getByText('Two Sum')).toBeInTheDocument();
      expect(screen.getByText('Arrays')).toBeInTheDocument();
      expect(screen.getByText('Recommended for you.')).toBeInTheDocument();
      
      // Check for child components
      expect(screen.getByTestId('coding-readiness-mock')).toBeInTheDocument();
      expect(screen.getByTestId('coding-analytics-mock')).toBeInTheDocument();
    });
  });
});
