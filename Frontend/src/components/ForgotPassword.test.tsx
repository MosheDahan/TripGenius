import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useLocation } from 'react-router-dom';
import { authService } from '../services/AuthService';
import { ForgotPassword } from './ForgotPassword';

jest.mock('react-router-dom', () => {
    const ReactModule = jest.requireActual('react');
    return {
        Link: ({ to, children }: { to: string; children: React.ReactNode }) =>
            ReactModule.createElement('a', { href: to }, children),
        useLocation: jest.fn()
    };
});

jest.mock('../services/AuthService', () => ({
    authService: {
        requestPasswordReset: jest.fn()
    }
}));

const requestPasswordReset = authService.requestPasswordReset as jest.Mock;
const mockUseLocation = useLocation as jest.Mock;

beforeEach(() => {
    requestPasswordReset.mockReset();
});

test('sends a reset request only to the email passed from the login screen', async () => {
    mockUseLocation.mockReturnValue({ state: { email: 'user@example.com' } });
    requestPasswordReset.mockResolvedValue('אם קיימת כתובת אימייל זו במערכת, נשלח אליה קישור לאיפוס הסיסמה.');
    render(<ForgotPassword />);

    const emailInput = screen.getByLabelText('כתובת אימייל');
    expect(emailInput).toHaveValue('user@example.com');
    expect(emailInput).toHaveAttribute('readonly');

    fireEvent.click(screen.getByRole('button', { name: 'שלח קישור לאיפוס' }));

    await waitFor(() => {
        expect(requestPasswordReset).toHaveBeenCalledWith('user@example.com');
    });
    expect(await screen.findByRole('status')).toHaveTextContent('אם קיימת כתובת אימייל זו במערכת');
});

test('does not allow a reset request without an email from login', () => {
    mockUseLocation.mockReturnValue({ state: null });
    render(<ForgotPassword />);

    expect(screen.getByRole('alert')).toHaveTextContent('חזור למסך ההתחברות');
    expect(screen.getByRole('button', { name: 'שלח קישור לאיפוס' })).toBeDisabled();
    expect(requestPasswordReset).not.toHaveBeenCalled();
});
