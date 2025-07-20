import type { AppDispatch } from './store';
import { clearAuth, setError, setLoading, setUser } from './authSlice';
import { getCurrentUser, logout as authLogout } from '../services/authService';
import toast from '../utils/toast';
import type { OnboardingData } from '../services/api';

// Get current user from API and update Redux state
export const fetchCurrentUser = () => async (dispatch: AppDispatch) => {
  try {
    dispatch(setLoading(true));
    const user = await getCurrentUser();
    dispatch(setUser(user));
    return user;
  } catch (error) {
    console.error('Error fetching current user:', error);
    dispatch(setError(error instanceof Error ? error.message : 'Failed to fetch user'));
    return null;
  }
};

// Handle user logout
export const logout = () => async (dispatch: AppDispatch) => {
  try {
    authLogout();
    dispatch(clearAuth());
  } catch (error) {
    console.error('Error during logout:', error);
    toast.error('Error during logout');
  }
};

// Complete onboarding
export const completeOnboarding = (data: OnboardingData) => async (dispatch: AppDispatch) => {
  try {
    dispatch(setLoading(true));
    
    // Call the API to complete onboarding
    const updatedUser = await import('../services/authService')
      .then(module => module.completeOnboarding(data));
    
    // Update the user in the Redux store
    if (updatedUser) {
      dispatch(setUser(updatedUser));
    }
    
    return updatedUser;
  } catch (error) {
    console.error('Error completing onboarding:', error);
    dispatch(setError(error instanceof Error ? error.message : 'Failed to complete onboarding'));
    toast.error('Failed to complete onboarding');
    throw error;
  }
};