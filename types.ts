
export interface Notebook {
  id: string;
  name: string;
  color: string;
  createdAt: number;
}

export interface Recording {
  id: string;
  notebookId: string;
  title: string;
  blob: Blob;
  duration: number;
  transcription?: string;
  summary?: string;
  createdAt: number;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
}

export interface AppState {
  notebooks: Notebook[];
  recordings: Recording[];
  activeNotebookId: string | null;
  isRecording: boolean;
  isSyncing: boolean;
  cloudProvider: 'google' | 'microsoft' | null;
}
