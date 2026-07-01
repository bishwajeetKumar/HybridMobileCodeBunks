import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ContractManagerView from './ContractManagerView.jsx';
import { ToastProvider } from './Toast.jsx';
import { freshStore } from '../domain/blueprint.js';

function renderCM(state, dispatch) {
  return render(
    <ToastProvider>
      <ContractManagerView state={state} dispatch={dispatch} />
    </ToastProvider>
  );
}

describe('ContractManagerView', () => {
  it('shows the bound blueprint version and a summary', () => {
    renderCM(freshStore(), jest.fn());
    expect(screen.getByText(/Blueprint v1/)).toBeInTheDocument();
    expect(screen.getByText('Active endpoints')).toBeInTheDocument();
    // seeded summary: 3 of 4 endpoints active -> 4 switches, 3 checked
    const switches = screen.getAllByRole('switch');
    expect(switches).toHaveLength(4);
    expect(switches.filter((s) => s.getAttribute('aria-checked') === 'true')).toHaveLength(3);
  });

  it('toggles an endpoint entitlement via the switch', async () => {
    const dispatch = jest.fn();
    renderCM(freshStore(), dispatch);
    const firstSwitch = screen.getAllByRole('switch')[0];
    await userEvent.click(firstSwitch);
    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'TOGGLE_ENDPOINT' })
    );
  });

  it('shows the empty-state banner when no versions exist', () => {
    const state = { ...freshStore(), versions: [] };
    renderCM(state, jest.fn());
    expect(screen.getByText(/No blueprint versions published yet/)).toBeInTheDocument();
  });

  it('dispatches NEW_CLIENT from the toolbar', async () => {
    const dispatch = jest.fn();
    renderCM(freshStore(), dispatch);
    await userEvent.click(screen.getByRole('button', { name: /New client/ }));
    expect(dispatch).toHaveBeenCalledWith({ type: 'NEW_CLIENT' });
  });
});
