import { openai } from "@/lib/openai"
import { 
  Situation, 
  DialogueStep, 
  UserResponse, 
  ScenarioProgress 
} from "@/types/situations"

export class SituationsService {
  private static instance: SituationsService
  private progressCache: Map<string, ScenarioProgress>
  private audioCache: Map<string, string>

  private constructor() {
    this.progressCache = new Map()
    this.audioCache = new Map()
  }

  static getInstance(): SituationsService {
    if (!SituationsService.instance) {
      SituationsService.instance = new SituationsService()
    }
    return SituationsService.instance
  }

  async generateScenario(situationId: string): Promise<DialogueStep[]> {
    const prompt = `Create an immersive French learning scenario for: ${situationId}.
Include:
1. Multiple conversation paths
2. Cultural context and regional variations
3. Common idioms and expressions
4. Grammar explanations
5. Pronunciation guides
6. Different formality levels
7. Expected user responses
8. Progressive difficulty

The scenario should adapt based on user performance and choices.`

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8,
      response_format: { type: "json_object" }
    })

    return JSON.parse(completion.choices[0].message.content || "[]")
  }

  async evaluateResponse(
    response: string, 
    expectedResponses: UserResponse[],
    context: DialogueStep
  ): Promise<UserResponse> {
    const prompt = `Evaluate this French response: "${response}"
Expected responses: ${JSON.stringify(expectedResponses)}
Context: ${JSON.stringify(context)}

Provide:
1. Accuracy score (0-100)
2. Grammar corrections
3. Pronunciation tips
4. Cultural appropriateness
5. Alternative expressions
6. Improvement suggestions`

    const evaluation = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3
    })

    return JSON.parse(evaluation.choices[0].message.content || "{}")
  }

  async generateAudio(text: string): Promise<string> {
    if (this.audioCache.has(text)) {
      return this.audioCache.get(text)!
    }

    const mp3 = await openai.audio.speech.create({
      model: "tts-1-hd",
      voice: "echo",
      input: text,
    })

    const buffer = Buffer.from(await mp3.arrayBuffer())
    const audioUrl = `data:audio/mp3;base64,${buffer.toString('base64')}`
    this.audioCache.set(text, audioUrl)
    
    return audioUrl
  }

  async saveProgress(progress: ScenarioProgress): Promise<void> {
    this.progressCache.set(progress.situationId, progress)
    // Also save to database
    await fetch('/api/situations/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(progress)
    })
  }

  getProgress(situationId: string): ScenarioProgress | undefined {
    return this.progressCache.get(situationId)
  }

  async getMetrics(situationId: string): Promise<SituationMetrics> {
    const response = await fetch(`/api/situations/metrics/${situationId}`)
    return response.json()
  }
}
