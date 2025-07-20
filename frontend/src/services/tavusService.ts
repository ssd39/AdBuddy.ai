import { TavusService } from './api/services/TavusService';
import toast from '../utils/toast';
import { handleApiError } from './authService';

// Re-export types from the generated API
export interface CreateConversationRequest {
  email: string;
  first_name?: string;
  last_name?: string;
}

export interface ConversationResponse {
  conversation_id: string;
  conversation_url: string;
}

export interface ConversationStatus {
  conversation_id: string;
  status: string;
  is_completed: boolean;
  created_at: string;
  completed_at?: string;
}

/**
 * Creates a Tavus conversation for video onboarding
 */
export async function createTavusConversation(
  data: CreateConversationRequest
): Promise<ConversationResponse> {
  try {
    return await TavusService.createConversationApiV1TavusCreateConversationPost({
      requestBody: data
    });
  } catch (error) {
    handleApiError(error);
    toast.error('Failed to create video call session');
    throw error;
  }
}

/**
 * Gets the status of a Tavus conversation
 */
export async function getConversationStatus(
  conversationId: string
): Promise<ConversationStatus> {
  try {
    return await TavusService.getConversationStatusApiV1TavusConversationStatusConversationIdGet({
      conversationId
    }) as ConversationStatus;
  } catch (error) {
    handleApiError(error);
    console.error('Error getting conversation status:', error);
    throw error;
  }
}

/**
 * Polls the conversation status until it's completed
 * @param conversationId The ID of the conversation to poll
 * @param interval The polling interval in milliseconds (default: 5000)
 * @param maxAttempts Maximum number of polling attempts (default: 120 - 10 minutes)
 * @returns Promise that resolves when the conversation is completed
 */
export function pollConversationStatus(
  conversationId: string,
  interval = 5000,
  maxAttempts = 120
): Promise<ConversationStatus> {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    
    const poll = async () => {
      try {
        const status = await getConversationStatus(conversationId);
        
        if (status.is_completed) {
          // Conversation is completed
          resolve(status);
          return;
        }
        
        attempts++;
        
        if (attempts >= maxAttempts) {
          // Exceeded maximum attempts
          reject(new Error('Conversation status polling timed out'));
          return;
        }
        
        // Schedule next poll
        setTimeout(poll, interval);
      } catch (error) {
        reject(error);
      }
    };
    
    // Start polling
    poll();
  });
}