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
  async sendMessage(
    prompt: string,
    userId: string,
    messages?: Message[]
  ): Promise<{ reply: string; tokensUsed?: number }> {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('No active session. Please log in.');
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({
            prompt,
            userId,
            messages,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
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
      const lastUserMessage = messages.filter(m => m.role === 'user').pop();
      const prompt = lastUserMessage?.content || '';

      const result = await this.sendMessage(prompt, options.userId, messages);

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
