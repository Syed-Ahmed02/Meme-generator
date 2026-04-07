export interface MemeTemplate {
  id: string
  name: string
  url: string
  width: number
  height: number
  boxCount: number
}

export interface TextLayer {
  id: string
  text: string
  x: number
  y: number
  width: number
  fontSize: number
  fontFamily: string
  fontStyle: string
  fill: string
  stroke: string
  strokeWidth: number
  align: string
}

export interface ChatMessage {
  role: "user" | "assistant"
  content: string
}

export interface MemeResult {
  templateId: string
  templateName: string
  templateUrl: string
  templateWidth: number
  templateHeight: number
  topText: string
  bottomText: string
}

export interface MemeChatMessage {
  _id: string
  sessionId: string
  role: "user" | "assistant"
  content: string
  imageDescription?: string
  memeResult?: MemeResult
  createdAt: number
}

export interface VideoJob {
  id: string
  status: "starting" | "processing" | "succeeded" | "failed"
  outputUrl?: string
  /** Replicate / model error message when status is failed */
  errorMessage?: string
}
