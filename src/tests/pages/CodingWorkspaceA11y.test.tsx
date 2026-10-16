// @vitest-environment jsdom
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CodingWorkspace from '../../pages/CodingWorkspace';
import { codingFrontendService } from '../../services/codingFrontendService';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

// Mock Monaco Editor
vi.mock('@monaco-editor/react', () => {
  return {
    default: ({ onChange }: any) => <textarea data-testid="monaco-mock" onChange={e => onChange(e.target.value)} />
  };
});

// Mock Clerk and Services
vi.mock('@clerk/clerk-react', () => ({
  useAuth: () => ({ getToken: vi.fn().mockResolvedValue('token') }),
  UserButton: () => <div data-testid="user-button" />,
}));

vi.mock('../../services/codingFrontendService', () => ({
  codingFrontendService: {
    getProblemBySlug: vi.fn(),
    executeCode: vi.fn()
  }
}));

const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn()
};
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

describe('CodingWorkspace Accessibility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(codingFrontendService.getProblemBySlug).mockResolvedValue({
      id: 'p1',
      title: 'A11y Test Problem',
      description: 'Solve this.',
      difficulty: 'EASY',
      slug: 'a11y-test'
    } as any);
  });

  const renderWorkspace = () => {
    return render(
      <MemoryRouter initialEntries={['/coding/problem/a11y-test']}>
        <Routes>
          <Route path="/coding/problem/:slug" element={<CodingWorkspace />} />
        </Routes>
      </MemoryRouter>
    );
  };

  it('renders accessible tablist and tabs for output pane', async () => {
    renderWorkspace();
    
    await waitFor(() => {
      const tablist = screen.getByRole('tablist', { name: /Output Views/i });
      expect(tablist).toBeInTheDocument();
    });

    const consoleTab = screen.getByRole('tab', { name: /Console/i });
    const testsTab = screen.getByRole('tab', { name: /^Tests$/i });
    const aiTab = screen.getByRole('tab', { name: /AI Feedback/i });

    expect(consoleTab).toHaveAttribute('aria-selected', 'true');
    expect(testsTab).toHaveAttribute('aria-selected', 'false');
    
    fireEvent.click(testsTab);
    expect(testsTab).toHaveAttribute('aria-selected', 'true');
    expect(consoleTab).toHaveAttribute('aria-selected', 'false');
  });

  it('provides an aria-live region for output', async () => {
    renderWorkspace();
    
    await waitFor(() => {
      // The output container should have aria-live="polite"
      const liveRegion = screen.getByText('Run your code to see the output here.').closest('[aria-live="polite"]');
      expect(liveRegion).toBeInTheDocument();
      expect(liveRegion).toHaveAttribute('aria-atomic', 'true');
    });
  });

  it('splitters have separator roles and keyboard navigability', async () => {
    const { container } = renderWorkspace();
    
    await waitFor(() => {
      const vSplitter = container.querySelector('[aria-label="Resize workspace panels"]');
      expect(vSplitter).toBeInTheDocument();
      expect(vSplitter).toHaveAttribute('role', 'separator');
      expect(vSplitter).toHaveAttribute('tabIndex', '0');
      expect(vSplitter).toHaveAttribute('aria-orientation', 'vertical');

      const hSplitter = container.querySelector('[aria-label="Resize editor and output panels"]');
      expect(hSplitter).toBeInTheDocument();
      expect(hSplitter).toHaveAttribute('role', 'separator');
      expect(hSplitter).toHaveAttribute('tabIndex', '0');
      expect(hSplitter).toHaveAttribute('aria-orientation', 'horizontal');
    });

    const vSplitter = container.querySelector('[aria-label="Resize workspace panels"]')!;
    const initialVal = Number(vSplitter.getAttribute('aria-valuenow'));
    
    // Simulate keyboard resize
    fireEvent.keyDown(vSplitter, { key: 'ArrowLeft' });
    await waitFor(() => {
      const updatedSplitter = container.querySelector('[aria-label="Resize workspace panels"]');
      expect(Number(updatedSplitter?.getAttribute('aria-valuenow'))).toBe(Math.max(20, initialVal - 5));
    });
  });
});
