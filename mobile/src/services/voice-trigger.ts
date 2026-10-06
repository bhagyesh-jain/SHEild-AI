import { Audio } from "expo-av";
import { Platform } from "react-native";

export type VoiceState = "idle" | "listening" | "detected" | "permission_denied" | "unavailable";

export interface VoiceTriggerOptions {
  onStateChange: (state: VoiceState, transcript?: string) => void;
  onKeywordDetected: (keyword: string) => void;
}

export class VoiceTriggerEngine {
  private recognition: any = null;
  private isListening: boolean = false;
  private lastTriggerTime: number = 0;
  private options: VoiceTriggerOptions | null = null;
  private isSupported: boolean = false;

  constructor() {
    this.checkSupport();
  }

  private checkSupport() {
    if (Platform.OS === "web" && typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      this.isSupported = !!SpeechRecognition;
    } else {
      const globalRec = (globalThis as any).SpeechRecognition || (globalThis as any).webkitSpeechRecognition;
      this.isSupported = !!globalRec;
    }
  }

  public getIsSupported(): boolean {
    return this.isSupported;
  }

  public async requestPermissions(): Promise<boolean> {
    try {
      if ((Audio as any) && (Audio as any).requestPermissionsAsync) {
        const audioStatus = await (Audio as any).requestPermissionsAsync();
        if (audioStatus && audioStatus.status !== "granted") {
          return false;
        }
      }

      if (Platform.OS === "web" && typeof navigator !== "undefined" && navigator.mediaDevices?.getUserMedia) {
        await navigator.mediaDevices.getUserMedia({ audio: true });
      }

      return true;
    } catch (err) {
      console.warn("[VoiceTrigger] Permission request failed:", err);
      return false;
    }
  }

  public async startListening(options: VoiceTriggerOptions): Promise<boolean> {
    this.options = options;

    const hasPermission = await this.requestPermissions();
    if (!hasPermission) {
      this.options.onStateChange("permission_denied");
      return false;
    }

    if (!this.isSupported) {
      this.options.onStateChange("unavailable");
      return false;
    }

    try {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition ||
        (globalThis as any).SpeechRecognition ||
        (globalThis as any).webkitSpeechRecognition;

      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = "en-US";

      this.recognition.onstart = () => {
        this.isListening = true;
        this.options?.onStateChange("listening");
      };

      this.recognition.onresult = (event: any) => {
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript.toLowerCase().trim();
          this.options?.onStateChange("listening", transcript);

          if (
            transcript.includes("help") ||
            transcript.includes("bachao") ||
            transcript.includes("save me") ||
            transcript.includes("madad")
          ) {
            const now = Date.now();
            if (now - this.lastTriggerTime > 5000) {
              this.lastTriggerTime = now;
              const keyword = transcript.includes("bachao") ? "bachao" : "help";
              this.options?.onStateChange("detected", transcript);
              this.options?.onKeywordDetected(keyword);
              this.stopListening();
              return;
            }
          }
        }
      };

      this.recognition.onerror = (event: any) => {
        console.warn("[VoiceTrigger] Recognition error:", event.error);
        if (event.error === "not-allowed" || event.error === "service-not-allowed") {
          this.options?.onStateChange("permission_denied");
        }
      };

      this.recognition.onend = () => {
        this.isListening = false;
        this.options?.onStateChange("idle");
      };

      this.recognition.start();
      return true;
    } catch (err) {
      console.warn("[VoiceTrigger] Failed starting voice engine:", err);
      this.options?.onStateChange("unavailable");
      return false;
    }
  }

  public stopListening() {
    this.isListening = false;
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {}
      this.recognition = null;
    }
    this.options?.onStateChange("idle");
  }
}

export const voiceTriggerEngine = new VoiceTriggerEngine();
