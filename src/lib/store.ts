import type { RzeczZnaleziona } from "./types";

class InMemoryStore {
  private items: RzeczZnaleziona[] = [];

  getAll(): RzeczZnaleziona[] {
    return [...this.items];
  }

  getById(id: string): RzeczZnaleziona | undefined {
    return this.items.find(item => item.id === id);
  }

  add(item: RzeczZnaleziona): RzeczZnaleziona {
    this.items.unshift(item);
    return item;
  }

  update(id: string, updates: Partial<RzeczZnaleziona>): RzeczZnaleziona | undefined {
    const index = this.items.findIndex(item => item.id === id);
    if (index === -1) return undefined;
    
    this.items[index] = { ...this.items[index], ...updates };
    return this.items[index];
  }

  delete(id: string): boolean {
    const index = this.items.findIndex(item => item.id === id);
    if (index === -1) return false;
    
    this.items.splice(index, 1);
    return true;
  }
}

export const inMemoryStore = new InMemoryStore();

