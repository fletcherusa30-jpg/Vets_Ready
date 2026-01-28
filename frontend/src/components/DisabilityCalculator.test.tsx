/**
 * Tests for DisabilityCalculator React component
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import DisabilityCalculator from './DisabilityCalculator';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('DisabilityCalculator Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    test('renders calculator with header', () => {
      render(<DisabilityCalculator />);

      expect(screen.getByText('Quick Disability Rating Calculator')).toBeInTheDocument();
      expect(screen.getByText(/VA-style combined rating/)).toBeInTheDocument();
    });

    test('renders initial condition input', () => {
      render(<DisabilityCalculator />);

      const inputs = screen.getAllByPlaceholderText(/Condition name/);
      expect(inputs).toHaveLength(1);
    });

    test('renders Add Condition button', () => {
      render(<DisabilityCalculator />);

      expect(screen.getByText('+ Add Condition')).toBeInTheDocument();
    });

    test('renders percentage input', () => {
      render(<DisabilityCalculator />);

      const percentageInputs = screen.getAllByDisplayValue('10');
      expect(percentageInputs.length).toBeGreaterThan(0);
    });

    test('renders side selector', () => {
      render(<DisabilityCalculator />);

      const selects = screen.getAllByDisplayValue('Both/N/A');
      expect(selects.length).toBeGreaterThan(0);
    });
  });

  describe('Adding Conditions', () => {
    test('adds a new condition when Add Condition button clicked', async () => {
      render(<DisabilityCalculator />);

      const addButton = screen.getByText('+ Add Condition');
      fireEvent.click(addButton);

      await waitFor(() => {
        const inputs = screen.getAllByPlaceholderText(/Condition name/);
        expect(inputs).toHaveLength(2);
      });
    });

    test('can add multiple conditions', async () => {
      render(<DisabilityCalculator />);

      const addButton = screen.getByText('+ Add Condition');
      fireEvent.click(addButton);
      fireEvent.click(addButton);

      await waitFor(() => {
        const inputs = screen.getAllByPlaceholderText(/Condition name/);
        expect(inputs).toHaveLength(3);
      });
    });
  });

  describe('Removing Conditions', () => {
    test('removes condition when remove button clicked', async () => {
      render(<DisabilityCalculator />);

      const addButton = screen.getByText('+ Add Condition');
      fireEvent.click(addButton);

      await waitFor(() => {
        const removeButtons = screen.getAllByText('✕');
        expect(removeButtons.length).toBeGreaterThan(0);
        fireEvent.click(removeButtons[0]);
      });

      await waitFor(() => {
        const inputs = screen.getAllByPlaceholderText(/Condition name/);
        expect(inputs).toHaveLength(1);
      });
    });

    test('disables remove button when only one condition', () => {
      render(<DisabilityCalculator />);

      const removeButtons = screen.getAllByText('✕');
      expect(removeButtons[0]).toBeDisabled();
    });
  });

  describe('Input Validation', () => {
    test('percentage input bounded to 0-100', async () => {
      render(<DisabilityCalculator />);

      const percentageInputs = screen.getAllByDisplayValue('10') as HTMLInputElement[];
      const input = percentageInputs[0];

      // Try to set to 150
      await userEvent.clear(input);
      await userEvent.type(input, '150');

      await waitFor(() => {
        // Component should clamp it
        expect(parseInt(input.value)).toBeLessThanOrEqual(100);
      });
    });

    test('condition name input accepts text', async () => {
      render(<DisabilityCalculator />);

      const nameInputs = screen.getAllByPlaceholderText(/Condition name/);

      await userEvent.type(nameInputs[0], 'Tinnitus');

      expect(nameInputs[0]).toHaveValue('Tinnitus');
    });
  });

  describe('API Integration', () => {
    test('calls API when condition entered', async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          true_combined_rating: 10.0,
          rounded_combined_rating: 10,
          bilateral_applied: false,
          steps: ['Tinnitus: 10%'],
          notes: []
        }
      });

      render(<DisabilityCalculator />);

      const nameInputs = screen.getAllByPlaceholderText(/Condition name/);
      await userEvent.type(nameInputs[0], 'Tinnitus');

      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalledWith(
          expect.stringContaining('/api/disability/combined-rating'),
          expect.any(Object)
        );
      });
    });

    test('displays results after API call', async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          true_combined_rating: 10.0,
          rounded_combined_rating: 10,
          bilateral_applied: false,
          steps: ['Tinnitus: 10%'],
          notes: []
        }
      });

      render(<DisabilityCalculator />);

      const nameInputs = screen.getAllByPlaceholderText(/Condition name/);
      await userEvent.type(nameInputs[0], 'Tinnitus');

      await waitFor(() => {
        expect(screen.getByText('10%')).toBeInTheDocument();
      });
    });

    test('displays error on API failure', async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error('API Error'));

      render(<DisabilityCalculator />);

      const nameInputs = screen.getAllByPlaceholderText(/Condition name/);
      await userEvent.type(nameInputs[0], 'Test');

      await waitFor(() => {
        expect(screen.getByText(/Error/)).toBeInTheDocument();
      });
    });
  });

  describe('Results Display', () => {
    test('displays combined rating when calculated', async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          true_combined_rating: 75.0,
          rounded_combined_rating: 80,
          bilateral_applied: false,
          steps: [],
          notes: []
        }
      });

      render(<DisabilityCalculator />);

      const nameInputs = screen.getAllByPlaceholderText(/Condition name/);
      await userEvent.type(nameInputs[0], 'Test');

      await waitFor(() => {
        expect(screen.getByText('80%')).toBeInTheDocument();
      });
    });

    test('displays true rating', async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          true_combined_rating: 56.45,
          rounded_combined_rating: 60,
          bilateral_applied: false,
          steps: [],
          notes: []
        }
      });

      render(<DisabilityCalculator />);

      const nameInputs = screen.getAllByPlaceholderText(/Condition name/);
      await userEvent.type(nameInputs[0], 'Test');

      await waitFor(() => {
        expect(screen.getByText('56.45%')).toBeInTheDocument();
      });
    });

    test('displays bilateral factor indication', async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          true_combined_rating: 60.0,
          rounded_combined_rating: 60,
          bilateral_applied: true,
          steps: [],
          notes: ['Bilateral factor applied']
        }
      });

      render(<DisabilityCalculator />);

      const nameInputs = screen.getAllByPlaceholderText(/Condition name/);
      await userEvent.type(nameInputs[0], 'Test');

      await waitFor(() => {
        expect(screen.getByText('✓ Applied')).toBeInTheDocument();
      });
    });

    test('displays notes when provided', async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          true_combined_rating: 60.0,
          rounded_combined_rating: 60,
          bilateral_applied: true,
          steps: [],
          notes: ['Bilateral factor applied to legs']
        }
      });

      render(<DisabilityCalculator />);

      const nameInputs = screen.getAllByPlaceholderText(/Condition name/);
      await userEvent.type(nameInputs[0], 'Test');

      await waitFor(() => {
        expect(screen.getByText('Bilateral factor applied to legs')).toBeInTheDocument();
      });
    });
  });

  describe('Calculation Details', () => {
    test('has expandable calculation details section', async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          true_combined_rating: 50.0,
          rounded_combined_rating: 50,
          bilateral_applied: false,
          steps: ['Step 1', 'Step 2'],
          notes: []
        }
      });

      render(<DisabilityCalculator />);

      const nameInputs = screen.getAllByPlaceholderText(/Condition name/);
      await userEvent.type(nameInputs[0], 'Test');

      await waitFor(() => {
        expect(screen.getByText(/Calculation Details/)).toBeInTheDocument();
      });
    });

    test('toggles details visibility', async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          true_combined_rating: 50.0,
          rounded_combined_rating: 50,
          bilateral_applied: false,
          steps: ['Step 1'],
          notes: []
        }
      });

      render(<DisabilityCalculator />);

      const nameInputs = screen.getAllByPlaceholderText(/Condition name/);
      await userEvent.type(nameInputs[0], 'Test');

      await waitFor(() => {
        const detailsBtn = screen.getByText(/Calculation Details/);
        fireEvent.click(detailsBtn);

        expect(screen.getByText('Step-by-Step Calculation')).toBeInTheDocument();
      });
    });
  });

  describe('Side Selection', () => {
    test('shows extremity group selector when side is not NONE', async () => {
      render(<DisabilityCalculator />);

      const sideSelects = screen.getAllByDisplayValue('Both/N/A');
      await userEvent.selectOptions(sideSelects[0], 'LEFT');

      await waitFor(() => {
        const extremitySelects = screen.getByDisplayValue('Select extremity...');
        expect(extremitySelects).toBeInTheDocument();
      });
    });

    test('allows extremity group selection', async () => {
      render(<DisabilityCalculator />);

      const sideSelects = screen.getAllByDisplayValue('Both/N/A');
      await userEvent.selectOptions(sideSelects[0], 'LEFT');

      await waitFor(() => {
        const extremitySelects = screen.getByDisplayValue('Select extremity...');
        expect(extremitySelects).toBeInTheDocument();
      });
    });
  });
});
