type Listener<T = any> = (payload: T) => void;

export class EventEmitterService {
  private events = new Map<string, Set<Listener>>();
  private firedOnce = new Map<string, any>();

  on<T = any>(event: string, listener: Listener<T>) {
    // se o evento já aconteceu (ex: ready), dispara imediatamente
    if (this.firedOnce.has(event)) {
      listener(this.firedOnce.get(event));
      return;
    }

    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }

    this.events.get(event)!.add(listener);
  };

  once<T = any>(event: string, listener: Listener<T>) {
    const wrapper: Listener<T> = (payload) => {
      this.off(event, wrapper);
      listener(payload);
    };

    this.on(event, wrapper);
  };

  off(event: string, listener: Listener) {
    this.events.get(event)?.delete(listener);
  };

  emit<T = any>(event: string, payload?: T, options?: { once?: boolean }) {
    if (options?.once) {
      this.firedOnce.set(event, payload);
    }

    this.events.get(event)?.forEach(fn => fn(payload as T));
  };

  clear(event?: string) {
    if (event) {
      this.events.delete(event);
      this.firedOnce.delete(event);
    } else {
      this.events.clear();
      this.firedOnce.clear();
    }
  };
};