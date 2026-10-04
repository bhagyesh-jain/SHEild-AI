import { createIncidentAPI, CreateIncidentPayload, IncidentResponse } from "./api";

export interface OutboxItem {
  id: string;
  payload: CreateIncidentPayload;
  queued_at: string;
  retry_count: number;
}

class OfflineOutbox {
  private queue: OutboxItem[] = [];

  constructor() {
    // In-memory local outbox storage
  }

  public enqueue(payload: CreateIncidentPayload): OutboxItem {
    const item: OutboxItem = {
      id: payload.client_event_id,
      payload,
      queued_at: new Date().toISOString(),
      retry_count: 0
    };
    // Avoid duplicate enqueueing of same client_event_id
    if (!this.queue.some(i => i.id === item.id)) {
      this.queue.push(item);
    }
    return item;
  }

  public getPending(): OutboxItem[] {
    return this.queue;
  }

  public async sync(): Promise<{ synced: IncidentResponse[]; failedCount: number }> {
    const synced: IncidentResponse[] = [];
    const remaining: OutboxItem[] = [];

    for (const item of this.queue) {
      item.retry_count += 1;
      const res = await createIncidentAPI(item.payload);
      if (res) {
        synced.push(res);
      } else {
        remaining.push(item);
      }
    }

    this.queue = remaining;
    return { synced, failedCount: remaining.length };
  }
}

export const offlineOutbox = new OfflineOutbox();
