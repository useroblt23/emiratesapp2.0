import { openaiClient } from './openaiClient';
import type { Message } from './openaiClient';

export async function getAIResponse(prompt: string, userId: string, systemPrompt?: string): Promise<string> {
  try {
    const messages: Message[] = [];

    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    } else {
      messages.push({
        role: 'system',
        content: 'You are an intelligent mentor and recruitment assistant.'
      });
    }

    messages.push({ role: 'user', content: prompt });

    const result = await openaiClient.sendMessage(prompt, userId, messages);
    return result.reply;
  } catch (error) {
    console.error('AI error:', error);
    throw error;
  }
}

export async function analyzeCVForEmirates(cvContent: string, userId: string): Promise<string> {
  const systemPrompt = `You are an experienced Emirates cabin crew recruiter with 10+ years of experience reviewing CVs. You understand what makes a candidate stand out for Emirates cabin crew positions. Provide honest, constructive feedback that helps candidates improve their applications.`;

  const userPrompt = `Please review the following CV for an Emirates cabin crew position and provide detailed feedback in the following format:

**OVERALL SCORE: X/10**

**STRENGTHS:**
- List 3-4 strong points

**AREAS FOR IMPROVEMENT:**
- List 3-4 areas that need work

**EMIRATES-SPECIFIC RECOMMENDATIONS:**
- List 3-4 specific tips for Emirates applications

**KEY ACTION ITEMS:**
- List 2-3 immediate changes to make

CV CONTENT:
${cvContent}`;

  return getAIResponse(userPrompt, userId, systemPrompt);
}

export async function getCabinCrewGuidance(question: string, userId: string): Promise<string> {
  const systemPrompt = `You are a friendly and knowledgeable Emirates cabin crew coach. You help aspiring cabin crew members prepare for their assessment day, interviews, and career. Provide practical, actionable advice with a warm and encouraging tone. Keep responses concise (2-3 paragraphs max) but helpful.`;

  return getAIResponse(question, userId, systemPrompt);
}
