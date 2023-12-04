import type { Client, ClientEvents } from 'discord.js';

type EventKeys = keyof ClientEvents;
type EventExecute<T extends EventKeys> = (client: Client, ...args: ClientEvents[T]) => Promise<unknown>;

export type Event<T extends EventKeys = EventKeys> = {
  eventName: T;
  execute: EventExecute<T>;
};
export function event<T extends EventKeys>(eventName: T, execute: EventExecute<T>): Event<T> {
  return { eventName, execute };
}

export function registerEvents(client: Client, events: Event[]) {
  for (const { eventName, execute } of events) {
    client.on(eventName, (...args) => {
      try {
        execute(client, ...args);
      } catch (error) {
        console.log(`[${eventName}] ERROR`, error);
      }
    });
  }
}
