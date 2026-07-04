import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DiscoveryDashboard from '../src/components/DiscoveryDashboard';
import HiddenGemList from '../src/components/HiddenGemList';
import StorytellingCard from '../src/components/StorytellingCard';

describe('CultureConnect UI Components Unit & Integration Tests', () => {

  // ==========================================
  // DISCOVERY DASHBOARD TESTS
  // ==========================================
  describe('DiscoveryDashboard Component', () => {
    const mockOnSearch = vi.fn();

    beforeEach(() => {
      mockOnSearch.mockClear();
    });

    it('should render search fields, suggestion tags, and API settings trigger', () => {
      render(<DiscoveryDashboard onSearch={mockOnSearch} eventsData={null} isLoading={false} currentQuery="" />);

      expect(screen.getByPlaceholderText(/Enter destination/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Travel Dates/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /GENERATE GUIDE/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /API Settings/i })).toBeInTheDocument();
      expect(screen.getByText(/Tokyo/i)).toBeInTheDocument();
    });

    it('should open and configure API keys in the settings modal', async () => {
      render(<DiscoveryDashboard onSearch={mockOnSearch} eventsData={null} isLoading={false} currentQuery="" />);
      
      const configButton = screen.getByRole('button', { name: /API Settings/i });
      fireEvent.click(configButton);

      // Verify modal opens
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByLabelText(/Gemini API Key/i)).toBeInTheDocument();

      const input = screen.getByLabelText(/Gemini API Key/i);
      fireEvent.change(input, { target: { value: 'test-key' } });
      
      const saveButton = screen.getByRole('button', { name: /SAVE KEY/i });
      fireEvent.click(saveButton);

      // Verify that after saving, state handles confirmation
      await waitFor(() => {
        expect(localStorage.getItem('LORE_SCAPES_GEMINI_KEY')).toBe('test-key');
      });
    });

    it('should trigger search callback when clicking suggestions', () => {
      render(<DiscoveryDashboard onSearch={mockOnSearch} eventsData={null} isLoading={false} currentQuery="" />);

      const suggestion = screen.getByText(/Tokyo/i);
      fireEvent.click(suggestion);

      expect(mockOnSearch).toHaveBeenCalledWith('Tokyo', 'May 12 - May 20');
    });

    it('should not allow empty search inputs', () => {
      render(<DiscoveryDashboard onSearch={mockOnSearch} eventsData={null} isLoading={false} currentQuery="" />);

      const form = screen.getByRole('button', { name: /GENERATE GUIDE/i });
      fireEvent.click(form);

      expect(mockOnSearch).not.toHaveBeenCalled();
    });
  });

  // ==========================================
  // HIDDEN GEM COMPARISON LIST TESTS
  // ==========================================
  describe('HiddenGemList Component', () => {
    const mockData = {
      city: 'Kyoto',
      touristTraps: [
        { name: 'Midday Temple', reason: 'Too crowded' }
      ],
      hiddenGems: [
        { name: 'Quiet Grove', type: 'Garden', description: 'Very peaceful', location: 'Arashiyama', vibe: 'Zen' }
      ]
    };
    const mockSelectGem = vi.fn();

    beforeEach(() => {
      mockSelectGem.mockClear();
    });

    it('should display tourist traps and hidden gems in columns', () => {
      render(<HiddenGemList data={mockData} onSelectGem={mockSelectGem} />);

      expect(screen.getByText(/Tourist Traps to Limit\/Avoid/i)).toBeInTheDocument();
      expect(screen.getByText(/Local Artisan & Hidden Gems/i)).toBeInTheDocument();
      
      expect(screen.getByText('Midday Temple')).toBeInTheDocument();
      expect(screen.getByText('Quiet Grove')).toBeInTheDocument();
      expect(screen.getByText(/Garden/i)).toBeInTheDocument();
    });

    it('should invoke select gem callback with name and city context', () => {
      render(<HiddenGemList data={mockData} onSelectGem={mockSelectGem} />);

      const storyButton = screen.getByRole('button', { name: /Listen to historical story about Quiet Grove/i });
      fireEvent.click(storyButton);

      expect(mockSelectGem).toHaveBeenCalledWith('Quiet Grove, Kyoto');
    });

    it('should invoke connect host callback when Meet Host button is clicked', () => {
      const mockOnConnect = vi.fn();
      render(<HiddenGemList data={mockData} onSelectGem={mockSelectGem} onConnect={mockOnConnect} />);

      const connectButton = screen.getByRole('button', { name: /Connect with local host at Quiet Grove/i });
      fireEvent.click(connectButton);

      expect(mockOnConnect).toHaveBeenCalledWith('Quiet Grove', 'Garden');
    });
  });

  // ==========================================
  // STORYTELLING CARD & WEB SPEECH SYNTHESIS TESTS
  // ==========================================
  describe('StorytellingCard Component', () => {
    const mockData = {
      title: 'Mossy Whispers',
      location: 'Quiet Grove, Kyoto',
      sensoryDetails: {
        sights: 'Deep green canopy',
        sounds: 'Rustling leaves',
        smells: 'Pine and damp earth'
      },
      narrative: {
        historicalContext: 'Founded in Edo period.',
        culturalSignificance: 'Represents simple life.',
        localLegend: 'Legend of the stone fox.'
      },
      insiderTip: 'Knock three times.'
    };

    it('should display poetic title, sensory details grid, and insider tip', () => {
      render(<StorytellingCard data={mockData} />);

      expect(screen.getByText('Mossy Whispers')).toBeInTheDocument();
      expect(screen.getByText('Deep green canopy')).toBeInTheDocument();
      expect(screen.getByText('Rustling leaves')).toBeInTheDocument();
      expect(screen.getByText(/Knock three times/i)).toBeInTheDocument();
    });

    it('should shift active content and tabs on click', () => {
      render(<StorytellingCard data={mockData} />);

      const historyTab = screen.getByRole('tab', { name: /History & Origins/i });
      const cultureTab = screen.getByRole('tab', { name: /Cultural Roots/i });
      const legendTab = screen.getByRole('tab', { name: /Local Folklore/i });

      // Default active should be history
      expect(historyTab).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByText('Founded in Edo period.')).toBeInTheDocument();

      // Click cultural tab
      fireEvent.click(cultureTab);
      expect(cultureTab).toHaveAttribute('aria-selected', 'true');
      expect(historyTab).toHaveAttribute('aria-selected', 'false');
      expect(screen.getByText('Represents simple life.')).toBeInTheDocument();

      // Click legend tab
      fireEvent.click(legendTab);
      expect(legendTab).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByText('Legend of the stone fox.')).toBeInTheDocument();
    });

    it('should manage voice narrator button toggle state', async () => {
      render(<StorytellingCard data={mockData} />);
      
      const listenButton = screen.getByRole('button', { name: /Listen to voice narrator/i });
      
      // Start speaking
      fireEvent.click(listenButton);
      expect(screen.getByRole('button', { name: /Pause voice narrator/i })).toBeInTheDocument();

      // Pause speaking
      fireEvent.click(screen.getByRole('button', { name: /Pause voice narrator/i }));
      expect(screen.getByRole('button', { name: /Listen to voice narrator/i })).toBeInTheDocument();
    });
  });
});
