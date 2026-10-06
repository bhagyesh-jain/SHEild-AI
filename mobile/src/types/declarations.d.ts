// Ambient module declarations for Expo SDK modules when full native types are omitted from root workspace
declare module 'expo-location' {
  export enum Accuracy {
    Lowest = 1,
    Low = 2,
    Balanced = 3,
    High = 4,
    Highest = 5,
    BestForNavigation = 6
  }
  export interface LocationObject {
    coords: {
      latitude: number;
      longitude: number;
      accuracy?: number | null;
      altitude?: number | null;
      heading?: number | null;
      speed?: number | null;
    };
    timestamp: number;
  }
  export function requestForegroundPermissionsAsync(): Promise<{ status: string }>;
  export function getCurrentPositionAsync(options?: { accuracy?: Accuracy }): Promise<LocationObject>;
}

declare module 'expo-av' {
  export namespace Audio {
    export class Sound {
      static createAsync(
        source: any,
        initialStatus?: any,
        onPlaybackStatusUpdate?: any,
        downloadFirst?: boolean
      ): Promise<{ sound: Sound; status: any }>;
      playAsync(): Promise<any>;
      stopAsync(): Promise<any>;
      unloadAsync(): Promise<any>;
      setIsLoopingAsync(isLooping: boolean): Promise<any>;
    }
    export function requestPermissionsAsync(): Promise<{ status: string }>;
    export class Recording {}
  }
}

declare module 'expo-sensors' {
  export const Accelerometer: {
    isAvailableAsync(): Promise<boolean>;
    setUpdateInterval(intervalMs: number): void;
    addListener(listener: (data: { x: number; y: number; z: number }) => void): { remove: () => void };
  };
}

declare module 'expo-haptics' {
  export enum ImpactFeedbackStyle {
    Light = 'light',
    Medium = 'medium',
    Heavy = 'heavy'
  }
  export enum NotificationFeedbackType {
    Success = 'success',
    Warning = 'warning',
    Error = 'error'
  }
  export function impactAsync(style?: ImpactFeedbackStyle): Promise<void>;
  export function notificationAsync(type?: NotificationFeedbackType): Promise<void>;
}
