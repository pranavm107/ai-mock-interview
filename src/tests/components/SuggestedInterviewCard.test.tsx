import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { describe, it, expect } from 'vitest';
import SuggestedInterviewCard from '../../components/interview/SuggestedInterviewCard';
import type { SuggestedInterview } from '../../types/recommendation';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';

describe('SuggestedInterviewCard', () => {
  const baseRecommendation: SuggestedInterview = {
    targetRole: 'SWE',
    targetCompany: 'Google',
    interviewType: 'Technical',
    difficulty: 'MEDIUM',
    experienceLevel: 'Mid',
    questionCount: 5,
    durationMinutes: 30,
    generatedAt: new Date().toISOString()
  };

  it('renders all standard fields correctly', () => {
    render(
      <MemoryRouter>
        <SuggestedInterviewCard recommendation={baseRecommendation} onStart={() => {}} />
      </MemoryRouter>
    );
    
    expect(screen.getByText('SWE')).toBeInTheDocument();
    expect(screen.getByText(/Google/i)).toBeInTheDocument();
    expect(screen.getByText(/5 questions/i)).toBeInTheDocument();
    expect(screen.getByText(/30 minutes/i)).toBeInTheDocument();
  });

  it('C18: Handles missing optional arrays (focusAreas, preparationFocus) defensively without crashing', () => {
    const recommendation: SuggestedInterview = {
      ...baseRecommendation,
      focusAreas: undefined,
      preparationFocus: undefined
    };

    expect(() => render(
      <MemoryRouter>
        <SuggestedInterviewCard recommendation={recommendation} onStart={() => {}} />
      </MemoryRouter>
    )).not.toThrow();
  });

  it('C18: Renders empty arrays correctly without crashing', () => {
    const recommendation: SuggestedInterview = {
      ...baseRecommendation,
      focusAreas: [],
      preparationFocus: []
    };

    expect(() => render(
      <MemoryRouter>
        <SuggestedInterviewCard recommendation={recommendation} onStart={() => {}} />
      </MemoryRouter>
    )).not.toThrow();
  });

  it('C18: Falls back to default reason if recommendationReason is missing', () => {
    const recommendation: SuggestedInterview = {
      ...baseRecommendation,
      recommendationReason: undefined
    };

    render(
      <MemoryRouter>
        <SuggestedInterviewCard recommendation={recommendation} onStart={() => {}} />
      </MemoryRouter>
    );
    
    const elements = screen.getAllByText(/Recommended based on your profile and interview activity/i);
    expect(elements.length).toBeGreaterThan(0);
  });

  it('renders focus areas when present', () => {
    const recommendation: SuggestedInterview = {
      ...baseRecommendation,
      focusAreas: ['React', 'TypeScript']
    };

    render(
      <MemoryRouter>
        <SuggestedInterviewCard recommendation={recommendation} onStart={() => {}} />
      </MemoryRouter>
    );
    
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
  });
});
