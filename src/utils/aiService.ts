const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY;

export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export async function getAIResponse(prompt: string, systemPrompt?: string): Promise<string> {
  try {
    const messages: AIMessage[] = [];

    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }

    messages.push({ role: 'user', content: prompt });

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages,
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `API Error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || 'No response generated.';
  } catch (error) {
    console.error('AI Service Error:', error);
    throw error;
  }
}

export async function analyzeCVForEmirates(cvContent: string): Promise<string> {
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

  return getAIResponse(userPrompt, systemPrompt);
}

export async function getCabinCrewGuidance(question: string): Promise<string> {
  const systemPrompt = `You are a friendly and knowledgeable Emirates cabin crew coach. You help aspiring cabin crew members prepare for their assessment day, interviews, and career. Provide practical, actionable advice with a warm and encouraging tone. Keep responses concise (2-3 paragraphs max) but helpful.`;

  return getAIResponse(question, systemPrompt);
}
