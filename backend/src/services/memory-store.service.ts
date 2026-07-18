interface MemoryEntry {
  value: string;
  expiresAt?: number;
}

class MemoryStoreService {
  private readonly store = new Map<string, MemoryEntry>();

  private isExpired(entry: MemoryEntry): boolean {
    return entry.expiresAt !== undefined && Date.now() > entry.expiresAt;
  }

  async set(key: string, value: string, expirySeconds?: number): Promise<void> {
    this.store.set(key, {
      value,
      expiresAt: expirySeconds ? Date.now() + expirySeconds * 1000 : undefined,
    });
  }

  async get(key: string): Promise<string | null> {
    const entry = this.store.get(key);
    if (!entry) return null;

    if (this.isExpired(entry)) {
      this.store.delete(key);
      return null;
    }

    return entry.value;
  }

  async del(key: string): Promise<void> {
    this.store.delete(key);
  }

  async exists(key: string): Promise<boolean> {
    const value = await this.get(key);
    return value !== null;
  }

  async sadd(key: string, member: string): Promise<void> {
    const current = await this.get(key);
    const members = current ? new Set(current.split('\u0000')) : new Set<string>();
    members.add(member);
    await this.set(key, [...members].join('\u0000'));
  }

  async srem(key: string, member: string): Promise<void> {
    const current = await this.get(key);
    if (!current) return;

    const members = new Set(current.split('\u0000'));
    members.delete(member);
    if (members.size === 0) {
      await this.del(key);
      return;
    }

    await this.set(key, [...members].join('\u0000'));
  }

  async smembers(key: string): Promise<string[]> {
    const current = await this.get(key);
    return current ? current.split('\u0000') : [];
  }
}

export const memoryStoreService = new MemoryStoreService();
