import { supabase } from '../lib/supabase';

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface AIResponse {
  output_text: string;
  tokens_used?: number;
}

export class OpenAIClient {
  private getAIEndpoint(): string {
    const isWebContainer = window.location.origin.includes('webcontainer-api');

    if (isWebContainer) {
      return 'http://127.0.0.1:54321/functions/v1/ai';
    }

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    return `${supabaseUrl}/functions/v1/ai`;
  }

  async sendMessage(
    messages: Message[],
    userId: string
  ): Promise<{ reply: string; tokensUsed?: number }> {
    try {
      if (!userId) {
        throw new Error('User ID is required. Please log in.');
      }

      const aiEndpoint = this.getAIEndpoint();

      const response = await fetch(aiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages, userId }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || errorData.message || `HTTP ${response.status}: ${response.statusText}`;

        if (errorMessage.includes('OpenAI API key not configured')) {
          throw new Error('AI service is not configured. Please contact the administrator to set up the OpenAI API key.');
        }

        throw new Error(errorMessage);
      }

      const data: AIResponse = await response.json();

      return {
        reply: data.output_text,
        tokensUsed: data.tokens_used,
      };
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error occurred');
      console.error('AI Client Error:', err);
      throw err;
    }
  }

  async streamChat(
    messages: Message[],
    options: {
      userId: string;
      onChunk?: (content: string) => void;
      onComplete?: (totalTokens?: number) => void;
      onError?: (error: Error) => void;
    }
  ): Promise<string> {
    try {
      const result = await this.sendMessage(messages, options.userId);

      if (options.onChunk) {
        options.onChunk(result.reply);
      }

      if (options.onComplete) {
        options.onComplete(result.tokensUsed);
      }

      return result.reply;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error occurred');
      if (options.onError) {
        options.onError(err);
      }
      throw err;
    }
  }
}

export const openaiClient = new OpenAIClient();
