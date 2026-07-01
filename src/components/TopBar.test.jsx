import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TopBar from './TopBar.jsx';

describe('TopBar', () => {
  it('renders the wordmark lockup and three roles', () => {
    render(<TopBar role="admin" onRoleChange={() => {}} />);
    expect(screen.getByText('Usage & Billing Platform')).toBeInTheDocument();
    expect(screen.getByText('Contract Management Console')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Admin/ })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Contract Manager/ })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Review/ })).toBeInTheDocument();
  });

  it('marks the current role as selected', () => {
    render(<TopBar role="review" onRoleChange={() => {}} />);
    expect(screen.getByRole('tab', { name: /Review/ })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: /Admin/ })).toHaveAttribute('aria-selected', 'false');
  });

  it('calls onRoleChange when a role is clicked', async () => {
    const onRoleChange = jest.fn();
    render(<TopBar role="admin" onRoleChange={onRoleChange} />);
    await userEvent.click(screen.getByRole('tab', { name: /Contract Manager/ }));
    expect(onRoleChange).toHaveBeenCalledWith('cm');
  });
});
