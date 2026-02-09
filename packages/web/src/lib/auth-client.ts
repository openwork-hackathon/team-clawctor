/**
 * Authentication client for handling user authentication
 * This is a mock implementation that should be replaced with actual auth service
 */

export interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
}

export interface AuthResult {
  data?: {
    user?: User;
    session?: {
      token: string;
      expiresAt: Date;
    };
  };
  error?: {
    message: string;
    code?: string;
  };
}

export interface SignInEmailParams {
  email: string;
  password: string;
}

export interface SignUpEmailParams {
  name: string;
  email: string;
  password: string;
}

export interface SignInSocialParams {
  provider: 'google' | 'github' | 'apple';
  callbackURL?: string;
}

class AuthClient {
  private baseURL: string;

  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || '/api';
  }

  signIn = {
    email: async (params: SignInEmailParams): Promise<AuthResult> => {
      try {
        const response = await fetch(`${this.baseURL}/auth/sign-in/email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(params),
          credentials: 'include',
        });

        const data = await response.json();

        if (!response.ok) {
          return {
            error: {
              message: data.message || 'Sign in failed',
              code: data.code || 'SIGN_IN_ERROR',
            },
          };
        }

        return { data };
      } catch (error) {
        return {
          error: {
            message: error instanceof Error ? error.message : 'Network error',
            code: 'NETWORK_ERROR',
          },
        };
      }
    },

    social: async (params: SignInSocialParams): Promise<AuthResult> => {
      try {
        const callbackURL = params.callbackURL || `${window.location.origin}/auth/callback`;
        
        // Redirect to OAuth provider
        window.location.href = `${this.baseURL}/auth/sign-in/${params.provider}?callbackURL=${encodeURIComponent(callbackURL)}`;
        
        // This won't actually return since we're redirecting
        return { data: {} };
      } catch (error) {
        return {
          error: {
            message: error instanceof Error ? error.message : 'Social sign in failed',
            code: 'SOCIAL_SIGN_IN_ERROR',
          },
        };
      }
    },
  };

  signUp = {
    email: async (params: SignUpEmailParams): Promise<AuthResult> => {
      try {
        const response = await fetch(`${this.baseURL}/auth/sign-up/email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(params),
          credentials: 'include',
        });

        const data = await response.json();

        if (!response.ok) {
          return {
            error: {
              message: data.message || 'Sign up failed',
              code: data.code || 'SIGN_UP_ERROR',
            },
          };
        }

        return { data };
      } catch (error) {
        return {
          error: {
            message: error instanceof Error ? error.message : 'Network error',
            code: 'NETWORK_ERROR',
          },
        };
      }
    },
  };

  signOut = async (): Promise<AuthResult> => {
    try {
      const response = await fetch(`${this.baseURL}/auth/sign-out`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        const data = await response.json();
        return {
          error: {
            message: data.message || 'Sign out failed',
            code: data.code || 'SIGN_OUT_ERROR',
          },
        };
      }

      return { data: {} };
    } catch (error) {
      return {
        error: {
          message: error instanceof Error ? error.message : 'Network error',
          code: 'NETWORK_ERROR',
        },
      };
    }
  };

  getSession = async (): Promise<AuthResult> => {
    try {
      const response = await fetch(`${this.baseURL}/auth/session`, {
        method: 'GET',
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          error: {
            message: data.message || 'Failed to get session',
            code: data.code || 'SESSION_ERROR',
          },
        };
      }

      return { data };
    } catch (error) {
      return {
        error: {
          message: error instanceof Error ? error.message : 'Network error',
          code: 'NETWORK_ERROR',
        },
      };
    }
  };
}

export const authClient = new AuthClient();
