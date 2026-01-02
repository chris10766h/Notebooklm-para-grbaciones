
import { Notebook, Recording } from '../types';

const DB_NAME = 'VoiceNotesDB';
const DB_VERSION = 1;
const STORE_NOTEBOOKS = 'notebooks';
const STORE_RECORDINGS = 'recordings';

export class StorageService {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NOTEBOOKS)) {
          db.createObjectStore(STORE_NOTEBOOKS, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORE_RECORDINGS)) {
          db.createObjectStore(STORE_RECORDINGS, { keyPath: 'id' });
        }
      };
    });
  }

  async getAllNotebooks(): Promise<Notebook[]> {
    return this.getAll<Notebook>(STORE_NOTEBOOKS);
  }

  async saveNotebook(notebook: Notebook): Promise<void> {
    return this.save(STORE_NOTEBOOKS, notebook);
  }

  async deleteNotebook(id: string): Promise<void> {
    const tx = this.db!.transaction([STORE_NOTEBOOKS, STORE_RECORDINGS], 'readwrite');
    tx.objectStore(STORE_NOTEBOOKS).delete(id);
    // Cleanup recordings for this notebook
    const recordings = await this.getRecordingsByNotebook(id);
    recordings.forEach(r => tx.objectStore(STORE_RECORDINGS).delete(r.id));
    return new Promise((res) => { tx.oncomplete = () => res(); });
  }

  async getRecordingsByNotebook(notebookId: string): Promise<Recording[]> {
    const all = await this.getAll<Recording>(STORE_RECORDINGS);
    return all.filter(r => r.notebookId === notebookId).sort((a, b) => b.createdAt - a.createdAt);
  }

  async saveRecording(recording: Recording): Promise<void> {
    return this.save(STORE_RECORDINGS, recording);
  }

  async deleteRecording(id: string): Promise<void> {
    return this.delete(STORE_RECORDINGS, id);
  }

  private async getAll<T>(storeName: string): Promise<T[]> {
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  private async save(storeName: string, data: any): Promise<void> {
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const request = store.put(data);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private async delete(storeName: string, id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

export const storage = new StorageService();
