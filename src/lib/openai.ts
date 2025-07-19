// src/lib/openai.ts

import OpenAI from "openai";

let _openai: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
  if (!_openai) {
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is required');
    }
    
    _openai = new OpenAI({
      apiKey: apiKey,
    });
  }
  
  return _openai;
}

// For backward compatibility
export const openai = {
  chat: {
    completions: {
      create: (...args: any[]) => getOpenAIClient().chat.completions.create(...args)
    }
  },
  audio: {
    transcriptions: {
      create: (...args: any[]) => getOpenAIClient().audio.transcriptions.create(...args)
    },
    speech: {
      create: (...args: any[]) => getOpenAIClient().audio.speech.create(...args)
    }
  }
};
