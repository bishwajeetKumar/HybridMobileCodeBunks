import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdminView from './AdminView.jsx';
import { ToastProvider } from './Toast.jsx';
import { freshStore } from '../domain/blueprint.js';

function renderAdmin(state, dispatch) {
  return render(
    <ToastProvider>
      <AdminView state={state} dispatch={dispatch} />
    </ToastProvider>
  );
}

describe('AdminView', () => {
  it('renders the three blueprint sections', () => {
    renderAdmin(freshStore(), jest.fn());
    expect(screen.getByText('Request Headers')).toBeInTheDocument();
    expect(screen.getByText('Available Endpoints')).toBeInTheDocument();
    expect(screen.getByText('SLA Tracking Fields')).toBeInTheDocument();
  });

  it('dispatches ADD_HEADER when "Add header" is clicked', async () => {
    const dispatch = jest.fn();
    renderAdmin(freshStore(), dispatch);
    await userEvent.click(screen.getByRole('button', { name: /Add header/ }));
    expect(dispatch).toHaveBeenCalledWith({ type: 'ADD_HEADER' });
  });

  it('dispatches SET_HEADER when editing a header key', async () => {
    const dispatch = jest.fn();
    const state = freshStore();
    renderAdmin(state, dispatch);
    const firstKey = screen.getAllByLabelText('Header key')[0];
    await userEvent.type(firstKey, 'Z');
    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'SET_HEADER', key: 'key' })
    );
  });

  it('dispatches PUBLISH from the publish button', async () => {
    const dispatch = jest.fn();
    renderAdmin(freshStore(), dispatch);
    await userEvent.click(screen.getByRole('button', { name: /Publish as new version/ }));
    expect(dispatch).toHaveBeenCalledWith({ type: 'PUBLISH' });
  });

  it('renders one row per seeded header', () => {
    renderAdmin(freshStore(), jest.fn());
    expect(screen.getAllByLabelText('Header key')).toHaveLength(4);
  });
});
