/**
 * Utility functions for semantic error message mapping
 * Maps backend API errors to user-friendly validation messages
 */

export interface FieldError {
  field: string;
  message: string;
}

/**
 * Extract field-specific errors from error messages
 */
export function extractFieldError(errorMessage: string): FieldError | null {
  const lowerMessage = errorMessage.toLowerCase();

  // Email errors
  if (lowerMessage.includes('email') && lowerMessage.includes('required')) {
    return { field: 'email', message: 'Email address is required' };
  }
  if (lowerMessage.includes('email') && (lowerMessage.includes('invalid') || lowerMessage.includes('format'))) {
    return { field: 'email', message: 'Please enter a valid email address (e.g., user@example.com)' };
  }
  if (lowerMessage.includes('email') && lowerMessage.includes('already')) {
    return { field: 'email', message: 'This email is already registered. Please use a different email or try logging in' };
  }

  // Password errors
  if (lowerMessage.includes('password') && lowerMessage.includes('required')) {
    return { field: 'password', message: 'Password is required' };
  }
  if (lowerMessage.includes('password') && (lowerMessage.includes('8') || lowerMessage.includes('length'))) {
    return { field: 'password', message: 'Password must be at least 8 characters long' };
  }
  if (lowerMessage.includes('password') && (lowerMessage.includes('uppercase') || lowerMessage.includes('lowercase') || lowerMessage.includes('digit') || lowerMessage.includes('special'))) {
    return { field: 'password', message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character' };
  }

  // Name errors
  if (lowerMessage.includes('name') && lowerMessage.includes('required')) {
    return { field: 'name', message: 'Name is required' };
  }
  if (lowerMessage.includes('name') && (lowerMessage.includes('2') || lowerMessage.includes('characters'))) {
    return { field: 'name', message: 'Name must be at least 2 characters long' };
  }

  // Authentication errors
  if (lowerMessage.includes('invalid credentials') || lowerMessage.includes('invalid email or password')) {
    return { field: 'general', message: 'Invalid email or password. Please check your credentials and try again' };
  }
  if (lowerMessage.includes('credentials') || lowerMessage.includes('password')) {
    return { field: 'password', message: 'The password you entered is incorrect' };
  }

  // Appointment errors
  if (lowerMessage.includes('appointment') && (lowerMessage.includes('date') || lowerMessage.includes('time'))) {
    return { field: 'appointment', message: 'Please select a valid date and time for your appointment' };
  }
  if (lowerMessage.includes('doctor')) {
    return { field: 'doctor', message: 'Please select a doctor for your appointment' };
  }

  // Session errors
  if (lowerMessage.includes('session') || lowerMessage.includes('expired')) {
    return { field: 'general', message: 'Your session has expired. Please log in again' };
  }
  if (lowerMessage.includes('authentication') || lowerMessage.includes('unauthorized')) {
    return { field: 'general', message: 'You need to be logged in to perform this action. Please log in' };
  }

  // Network/connection errors
  if (lowerMessage.includes('network') || lowerMessage.includes('fetch') || lowerMessage.includes('connection')) {
    return { field: 'general', message: 'Unable to connect to the server. Please check your internet connection and try again' };
  }

  return null;
}

/**
 * Get a user-friendly error message from an error
 */
export function getSemanticErrorMessage(error: unknown): string {
  if (!error) return 'An unexpected error occurred. Please try again';

  const errorMessage = error instanceof Error ? error.message : String(error);
  const fieldError = extractFieldError(errorMessage);

  if (fieldError) {
    return fieldError.message;
  }

  // Map common generic error messages
  const lowerMessage = errorMessage.toLowerCase();

  if (lowerMessage.includes('api error') || lowerMessage.includes('failed to')) {
    // Try to extract the actual error from the message
    const match = errorMessage.match(/(?:failed to|error:)\s*(.+)/i);
    if (match && match[1]) {
      return match[1].charAt(0).toUpperCase() + match[1].slice(1);
    }
    return 'Something went wrong. Please try again or contact support if the problem persists';
  }

  // Return the original message if it's already user-friendly
  if (errorMessage.length < 100 && !errorMessage.includes('Error') && !errorMessage.includes('Exception')) {
    return errorMessage;
  }

  return 'An error occurred. Please check your input and try again';
}

/**
 * Get field-specific error message
 */
export function getFieldErrorMessage(error: unknown, field: string): string | null {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const fieldError = extractFieldError(errorMessage);

  if (fieldError && fieldError.field === field) {
    return fieldError.message;
  }

  return null;
}

