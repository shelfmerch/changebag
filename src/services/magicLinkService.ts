
import { MagicLinkPayload } from '@/types';

/**
 * In a real application, this would be a backend service.
 * For now, we'll simulate it in the frontend.
 */
export const magicLinkService = {
  /**
   * Generate a magic link token
   */
  generateToken: (userId: string, waitlistId: string): string => {
    // In a real implementation, this would be a secure token
    return `wl_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
  },

  /**
   * Create a magic link payload
   */
  createMagicLink: (userId: string, waitlistId: string, causeId: string, email: string): MagicLinkPayload => {
    const token = magicLinkService.generateToken(userId, waitlistId);
    const expires = new Date();
    expires.setHours(expires.getHours() + 48); // 48 hour expiration
    
    return {
      token,
      userId,
      waitlistId,
      causeId,
      email,
      expires
    };
  },

  /**
   * Generate the full magic link URL
   */
  getMagicLinkUrl: (payload: MagicLinkPayload): string => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/claim/magic-link?token=${payload.token}&causeId=${payload.causeId}`;
  },

  /**
   * Validate a magic link token (mock implementation)
   */
  validateToken: (token: string): Promise<{valid: boolean, data?: any}> => {
    return new Promise((resolve) => {
      // Simulate API call
      setTimeout(() => {
        // In a real implementation, this would validate against a database
        const valid = token !== 'invalid';
        
        if (valid) {
          resolve({
            valid: true,
            data: {
              userId: 'user123',
              waitlistId: 'waitlist123',
              causeId: '1'
            }
          });
        } else {
          resolve({ valid: false });
        }
      }, 1000);
    });
  }
};
