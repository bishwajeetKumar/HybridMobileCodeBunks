import { render, screen } from '@testing-library/react';
import ReviewView from './ReviewView.jsx';
import { ToastProvider } from './Toast.jsx';
import { freshStore } from '../domain/blueprint.js';

function renderReview(state) {
  return render(
    <ToastProvider>
      <ReviewView state={state} dispatch={() => {}} />
    </ToastProvider>
  );
}

describe('ReviewView', () => {
  it('renders a read-only contract document for the active client', () => {
    renderReview(freshStore());
    expect(screen.getByRole('heading', { name: 'Northwind Analytics' })).toBeInTheDocument();
    expect(screen.getByText('Usage-Based Billing Contract')).toBeInTheDocument();
    expect(screen.getByText('Metered Endpoints & Rates')).toBeInTheDocument();
    expect(screen.getByText('SLA Commitments')).toBeInTheDocument();
  });

  it('marks entitled vs not-entitled endpoints', () => {
    renderReview(freshStore());
    expect(screen.getAllByText('Entitled').length).toBe(3);
    expect(screen.getByText('Not entitled')).toBeInTheDocument();
  });

  it('shows the empty-state when nothing is published', () => {
    renderReview({ ...freshStore(), versions: [] });
    expect(screen.getByText(/Nothing to review yet/)).toBeInTheDocument();
  });
});
