import * as Sensors from "expo-sensors";

const Accelerometer = (Sensors as any).Accelerometer;

export interface ShakeDetectorOptions {
  threshold?: number;
  requiredPeaks?: number;
  windowMs?: number;
  cooldownMs?: number;
  onShakeDetected: () => void;
}

export class ShakeDetector {
  private subscription: any = null;
  private peakTimestamps: number[] = [];
  private lastTriggerTime: number = 0;
  private isListening: boolean = false;
  private isAvailable: boolean = false;

  public async init(): Promise<boolean> {
    try {
      if ((Accelerometer as any) && (Accelerometer as any).isAvailableAsync) {
        this.isAvailable = await (Accelerometer as any).isAvailableAsync();
      } else {
        this.isAvailable = false;
      }
    } catch (e) {
      this.isAvailable = false;
    }
    return this.isAvailable;
  }

  public getIsAvailable(): boolean {
    return this.isAvailable;
  }

  public async start(options: ShakeDetectorOptions): Promise<boolean> {
    this.stop();
    const threshold = options.threshold || 3.0;
    const requiredPeaks = options.requiredPeaks || 2;
    const windowMs = options.windowMs || 1500;
    const cooldownMs = options.cooldownMs || 5000;

    await this.init();
    if (!this.isAvailable) {
      console.warn("[ShakeDetector] Accelerometer hardware unavailable on this device/environment");
      return false;
    }

    try {
      if ((Accelerometer as any).setUpdateInterval) {
        (Accelerometer as any).setUpdateInterval(150);
      }

      this.subscription = (Accelerometer as any).addListener((data: { x: number; y: number; z: number }) => {
        const now = Date.now();

        // 1. Refractory Cooldown Check
        if (now - this.lastTriggerTime < cooldownMs) {
          return;
        }

        // 2. Calculate acceleration magnitude
        const magnitude = Math.abs(data.x || 0) + Math.abs(data.y || 0) + Math.abs(data.z || 0);

        if (magnitude >= threshold) {
          // Filter peak timestamps within rolling window
          this.peakTimestamps = this.peakTimestamps.filter(t => now - t <= windowMs);
          this.peakTimestamps.push(now);

          // 3. Deliberate multi-peak check
          if (this.peakTimestamps.length >= requiredPeaks) {
            this.lastTriggerTime = now;
            this.peakTimestamps = [];
            options.onShakeDetected();
          }
        }
      });

      this.isListening = true;
      return true;
    } catch (err) {
      console.warn("[ShakeDetector] Failed starting accelerometer subscription:", err);
      this.isListening = false;
      return false;
    }
  }

  public stop() {
    this.isListening = false;
    if (this.subscription) {
      try {
        this.subscription.remove();
      } catch (e) {}
      this.subscription = null;
    }
  }
}

export const shakeDetector = new ShakeDetector();
