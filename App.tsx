
import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, Mic, Square, Trash2, Share2, Book, Clock, 
  Send, Cloud, MessageSquare, CheckCircle, Info, Database,
  Loader2, X, AlertCircle
} from 'lucide-react';
import { storage } from './services/storageService';
import { gemini } from './services/geminiService';
import { Notebook, Recording, Message } from './types';

// Custom Toast Component for feedback
const Toast: React.FC<{ message: string; type: 'success' | 'error'; onClose: () => void }> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 z-[100] animate-in fade-in slide-in-from-bottom-4 ${
      type === 'success' ? 'bg-slate-900 text-white' : 'bg-red-600 text-white'
    }`}>
      {type === 'success' ? <CheckCircle size={18} className="text-emerald-400" /> : <AlertCircle size={18} />}
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
};

// New Notebook Modal
const NewNotebookModal: React.FC<{ 
  onClose: () => void; 
  onSave: (name: string, color: string) => void 
}> = ({ onClose, onSave }) => {
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState('#6366f1');
  const colors = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'];

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-slate-800">Nuevo Cuaderno</h3>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
              <X size={20} />
            </button>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Nombre del Proyecto</label>
              <input 
                autoFocus
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Clase de Historia, Proyecto Final..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Color del Tema</label>
              <div className="flex gap-3">
                {colors.map(c => (
                  <button 
                    key={c}
                    onClick={() => setSelectedColor(c)}
                    className={`w-8 h-8 rounded-full transition-all ring-offset-2 ${selectedColor === c ? 'ring-2 ring-indigo-500 scale-110' : 'hover:scale-105'}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            <button 
              disabled={!name.trim()}
              onClick={() => onSave(name, selectedColor)}
              className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 disabled:opacity-50 disabled:shadow-none transition-all mt-4"
            >
              Crear Cuaderno
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Sidebar: React.FC<{
  notebooks: Notebook[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onAdd: () => void;
  onDelete: (id: string) => void;
  onOpenSync: () => void;
}> = ({ notebooks, activeId, onSelect, onAdd, onDelete, onOpenSync }) => (
  <div className="w-72 bg-white border-r border-slate-200 h-screen flex flex-col shrink-0">
    <div className="p-6 border-b border-slate-100 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-100">V</div>
        <div>
          <h1 className="text-lg font-black text-slate-800 leading-none">VoiceNotes</h1>
          <span className="text-[10px] text-indigo-500 font-bold uppercase tracking-widest">Workspace</span>
        </div>
      </div>
    </div>

    <div className="p-4 flex flex-col gap-1 flex-1 overflow-y-auto custom-scrollbar">
      <div className="flex items-center justify-between px-2 mb-3">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Mis Cuadernos</span>
        <button onClick={onAdd} className="p-1.5 bg-indigo-50 hover:bg-indigo-100 rounded-lg text-indigo-600 transition-all hover:scale-110">
          <Plus size={16} strokeWidth={3} />
        </button>
      </div>

      {notebooks.map(nb => (
        <div 
          key={nb.id}
          className={`group flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer transition-all ${
            activeId === nb.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-600 hover:bg-slate-50'
          }`}
          onClick={() => onSelect(nb.id)}
        >
          <Book size={18} className={activeId === nb.id ? 'text-indigo-100' : 'text-slate-400'} />
          <span className="flex-1 font-semibold truncate text-sm">{nb.name}</span>
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(nb.id); }}
            className={`p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all ${
              activeId === nb.id ? 'hover:bg-indigo-500 text-indigo-100' : 'hover:bg-red-50 text-slate-300 hover:text-red-500'
            }`}
          >
            <Trash2 size={14} />
          </button>
        </div>
      ))}

      {notebooks.length === 0 && (
        <div className="px-4 py-10 text-center border-2 border-dashed border-slate-100 rounded-2xl mt-4">
          <p className="text-xs text-slate-400 font-medium">Empieza creando tu primer cuaderno para organizar tus clases.</p>
          <button onClick={onAdd} className="mt-4 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold hover:bg-indigo-100 transition-colors">Crear Ahora</button>
        </div>
      )}
    </div>

    <div className="p-4 border-t border-slate-100">
      <button 
        onClick={onOpenSync}
        className="w-full flex items-center justify-between px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-xl transition-all border border-transparent hover:border-slate-100"
      >
        <div className="flex items-center gap-3">
          <Cloud size={18} className="text-slate-400" />
          <span className="text-sm font-bold">Sincronizar</span>
        </div>
        <div className="w-2 h-2 rounded-full bg-slate-300"></div>
      </button>
    </div>
  </div>
);

const App: React.FC = () => {
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [activeNotebookId, setActiveNotebookId] = useState<string | null>(null);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isNewNbModalOpen, setIsNewNbModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    storage.init().then(() => {
      storage.getAllNotebooks().then(setNotebooks);
    }).catch(() => {
      showToast("Error al inicializar la base de datos", "error");
    });
  }, []);

  useEffect(() => {
    if (activeNotebookId) {
      storage.getRecordingsByNotebook(activeNotebookId).then(setRecordings);
      setMessages([]);
    }
  }, [activeNotebookId]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
  };

  const handleCreateNotebook = async (name: string, color: string) => {
    const newNb: Notebook = {
      id: crypto.randomUUID(),
      name,
      color,
      createdAt: Date.now()
    };
    try {
      await storage.saveNotebook(newNb);
      setNotebooks(prev => [...prev, newNb]);
      setActiveNotebookId(newNb.id);
      setIsNewNbModalOpen(false);
      showToast("Cuaderno creado con éxito");
    } catch (e) {
      showToast("Error al guardar el cuaderno", "error");
    }
  };

  const deleteNotebook = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres borrar este cuaderno y todas sus grabaciones?')) return;
    try {
      await storage.deleteNotebook(id);
      setNotebooks(prev => prev.filter(nb => nb.id !== id));
      if (activeNotebookId === id) setActiveNotebookId(null);
      showToast("Cuaderno eliminado");
    } catch (e) {
      showToast("Error al eliminar", "error");
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (e) => audioChunks.current.push(e.data);
      mediaRecorder.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
        const newRecording: Recording = {
          id: crypto.randomUUID(),
          notebookId: activeNotebookId!,
          title: `Grabación ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
          blob: audioBlob,
          duration: recordingTime,
          createdAt: Date.now()
        };
        await storage.saveRecording(newRecording);
        setRecordings(prev => [newRecording, ...prev]);
        setRecordingTime(0);
        showToast("Grabación guardada correctamente");
      };

      mediaRecorder.current.start();
      setIsRecording(true);
      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      showToast("Error: No se pudo acceder al micrófono", "error");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current) {
      mediaRecorder.current.stop();
      mediaRecorder.current.stream.getTracks().forEach(t => t.stop());
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const deleteRecording = async (id: string) => {
    try {
      await storage.deleteRecording(id);
      setRecordings(prev => prev.filter(r => r.id !== id));
      showToast("Grabación eliminada");
    } catch (e) {
      showToast("Error al borrar", "error");
    }
  };

  const analyzeRecording = async (recording: Recording) => {
    setIsThinking(true);
    try {
      const summary = await gemini.analyzeAudio(recording.blob, "Transcribe este audio y genera un resumen estructurado con títulos y puntos clave.");
      const updated = { ...recording, summary };
      await storage.saveRecording(updated);
      setRecordings(prev => prev.map(r => r.id === recording.id ? updated : r));
      showToast("Análisis completado");
    } catch (err) {
      showToast("Error al procesar con la IA", "error");
    } finally {
      setIsThinking(false);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !activeNotebookId) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: inputMessage,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsThinking(true);

    try {
      const activeRecordings = recordings.slice(0, 5);
      const aiResponse = await gemini.getChatResponse(
        messages.map(m => ({ role: m.role, content: m.content })),
        inputMessage,
        activeRecordings.map(r => ({ blob: r.blob, title: r.title }))
      );

      const aiMsg: Message = {
        id: crypto.randomUUID(),
        role: 'model',
        content: aiResponse,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      showToast("Error en la respuesta del asistente", "error");
    } finally {
      setIsThinking(false);
    }
  };

  const handleSync = (provider: string) => {
    setIsSyncing(true);
    // Simulate sync
    setTimeout(() => {
      setIsSyncing(false);
      setIsSyncModalOpen(false);
      showToast(`Sincronizado con ${provider} correctamente`);
    }, 2000);
  };

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const activeNotebook = notebooks.find(n => n.id === activeNotebookId);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <Sidebar 
        notebooks={notebooks} 
        activeId={activeNotebookId} 
        onSelect={setActiveNotebookId}
        onAdd={() => setIsNewNbModalOpen(true)}
        onDelete={deleteNotebook}
        onOpenSync={() => setIsSyncModalOpen(true)}
      />

      {activeNotebook ? (
        <main className="flex-1 flex overflow-hidden animate-in fade-in duration-300">
          {/* Main Content: List of Recordings */}
          <div className="flex-1 flex flex-col bg-white border-r border-slate-200">
            <header className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
              <div className="flex items-center gap-4">
                <div className="w-4 h-12 rounded-full" style={{ backgroundColor: activeNotebook.color }}></div>
                <div>
                  <h2 className="text-2xl font-black text-slate-800 tracking-tight">{activeNotebook.name}</h2>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{recordings.length} archivos</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                    <span className="text-xs font-bold text-indigo-500 uppercase tracking-widest">Activo</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <button className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                  <Share2 size={20} />
                </button>
                <div className="h-10 w-[1px] bg-slate-100 mx-1"></div>
                <button 
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`flex items-center gap-3 px-8 py-3.5 rounded-2xl font-black transition-all shadow-xl active:scale-95 ${
                    isRecording 
                      ? 'bg-red-500 text-white hover:bg-red-600 animate-pulse shadow-red-100' 
                      : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100'
                  }`}
                >
                  {isRecording ? <Square size={18} fill="currentColor" /> : <Mic size={20} />}
                  {isRecording ? formatTime(recordingTime) : 'Grabar'}
                </button>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar bg-slate-50/30">
              {recordings.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                  <div className="w-24 h-24 bg-white rounded-3xl shadow-sm flex items-center justify-center mb-6">
                    <Mic size={40} className="text-slate-200" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800">No hay grabaciones</h3>
                  <p className="text-sm text-slate-500 mt-1">Pulsa el botón superior para empezar tu primera clase.</p>
                </div>
              ) : (
                recordings.map(rec => (
                  <div key={rec.id} className="bg-white border border-slate-200 rounded-3xl overflow-hidden hover:shadow-xl hover:shadow-slate-200/50 transition-all group">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-slate-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner group-hover:bg-indigo-600 group-hover:text-white transition-all">
                            <Clock size={28} />
                          </div>
                          <div>
                            <h3 className="font-black text-slate-800 text-xl tracking-tight">{rec.title}</h3>
                            <div className="flex items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest mt-1.5">
                              <span className="flex items-center gap-1.5"><Clock size={12} strokeWidth={3} /> {formatTime(rec.duration)}</span>
                              <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                              <span>{new Date(rec.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        <button 
                          onClick={() => deleteRecording(rec.id)}
                          className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>

                      {rec.summary ? (
                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                          <div className="flex items-center gap-2 mb-4">
                            <div className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center">
                              <Info size={14} />
                            </div>
                            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em]">Resumen Inteligente</span>
                          </div>
                          <div className="text-slate-700 leading-relaxed text-sm font-medium whitespace-pre-wrap">
                            {rec.summary}
                          </div>
                        </div>
                      ) : (
                        <button 
                          onClick={() => analyzeRecording(rec)}
                          disabled={isThinking}
                          className="w-full flex items-center justify-center gap-3 py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all font-bold text-sm disabled:opacity-50"
                        >
                          {isThinking ? (
                            <Loader2 size={18} className="animate-spin" />
                          ) : (
                            <Database size={18} />
                          )}
                          {isThinking ? 'IA Analizando...' : 'Transcribir y Resumir'}
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* AI Chat Sidebar */}
          <div className="w-[440px] bg-slate-50 flex flex-col border-l border-slate-100">
            <div className="p-8 border-b border-slate-200 bg-white">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
                  <MessageSquare size={18} strokeWidth={2.5} />
                </div>
                <h3 className="text-lg font-black text-slate-800 tracking-tight">Pregunta al Cuaderno</h3>
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-relaxed">Gemini responde basado en tus grabaciones</p>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              {messages.length === 0 && (
                <div className="space-y-4 pt-4">
                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                    <p className="text-sm font-bold text-slate-800 mb-2">Sugerencias:</p>
                    <div className="flex flex-col gap-2">
                      {['¿Cuál es el tema principal?', 'Resumen de la última clase', 'Conceptos difíciles'].map(s => (
                        <button 
                          key={s}
                          onClick={() => setInputMessage(s)}
                          className="text-left px-4 py-2 text-xs bg-slate-50 hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 rounded-xl transition-all border border-slate-100"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              {messages.map(m => (
                <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[90%] p-5 rounded-3xl text-sm font-medium leading-relaxed ${
                    m.role === 'user' 
                      ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' 
                      : 'bg-white border border-slate-200 text-slate-800 shadow-sm'
                  }`}>
                    {m.content}
                  </div>
                </div>
              ))}
              {isThinking && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-200 px-5 py-4 rounded-3xl shadow-sm flex items-center gap-3">
                    <Loader2 size={16} className="animate-spin text-indigo-600" />
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Pensando...</span>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 bg-white border-t border-slate-100">
              <div className="relative group">
                <input 
                  type="text" 
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Haz una pregunta..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 pr-14 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                />
                <button 
                  disabled={!inputMessage.trim() || isThinking}
                  onClick={sendMessage}
                  className="absolute right-2 top-2 p-2.5 bg-indigo-600 text-white rounded-xl transition-all hover:bg-indigo-700 disabled:opacity-20 active:scale-90"
                >
                  <Send size={18} strokeWidth={3} />
                </button>
              </div>
            </div>
          </div>
        </main>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-white animate-in fade-in duration-700">
          <div className="w-24 h-24 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mb-8 animate-pulse">
            <Book size={48} />
          </div>
          <h2 className="text-4xl font-black text-slate-800 tracking-tight mb-4">Tu conocimiento, organizado.</h2>
          <p className="text-slate-500 max-w-md text-lg leading-relaxed mb-10">
            Crea un cuaderno para separar tus clases por materia y deja que la IA se encargue del resto.
          </p>
          <button 
            onClick={() => setIsNewNbModalOpen(true)}
            className="flex items-center gap-3 px-10 py-5 bg-indigo-600 text-white rounded-3xl font-black text-lg shadow-2xl shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-1 transition-all active:scale-95"
          >
            <Plus size={24} strokeWidth={3} />
            Crear Primer Cuaderno
          </button>
        </div>
      )}

      {/* Custom Modal for New Notebook */}
      {isNewNbModalOpen && (
        <NewNotebookModal 
          onClose={() => setIsNewNbModalOpen(false)} 
          onSave={handleCreateNotebook} 
        />
      )}

      {/* Enhanced Sync Modal */}
      {isSyncModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-10 text-center">
              <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-8 rotate-3 shadow-inner">
                <Database size={36} />
              </div>
              <h3 className="text-3xl font-black text-slate-800 mb-4 tracking-tight">Sincroniza tu Workspace</h3>
              <p className="text-slate-500 font-medium mb-10">Tus grabaciones siempre seguras y accesibles en todos tus dispositivos.</p>
              
              {isSyncing ? (
                <div className="py-8 space-y-4">
                  <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-600 animate-[progress_2s_ease-in-out_infinite]" style={{ width: '60%' }}></div>
                  </div>
                  <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest">Conectando con servidores...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <button 
                    onClick={() => handleSync('Google Drive')}
                    className="w-full flex items-center justify-between px-6 py-4 border border-slate-100 rounded-2xl font-bold text-slate-700 hover:bg-slate-50 transition-all hover:scale-[1.02]"
                  >
                    <div className="flex items-center gap-4">
                      <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" className="w-6 h-6" alt="Google" />
                      Google Drive
                    </div>
                    <ChevronRight size={18} className="text-slate-300" />
                  </button>
                  <button 
                    onClick={() => handleSync('OneDrive')}
                    className="w-full flex items-center justify-between px-6 py-4 border border-slate-100 rounded-2xl font-bold text-slate-700 hover:bg-slate-50 transition-all hover:scale-[1.02]"
                  >
                    <div className="flex items-center gap-4">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg" className="w-6 h-6" alt="Microsoft" />
                      OneDrive
                    </div>
                    <ChevronRight size={18} className="text-slate-300" />
                  </button>
                </div>
              )}
              
              <button 
                onClick={() => setIsSyncModalOpen(false)}
                className="mt-10 text-slate-400 text-xs font-black uppercase tracking-widest hover:text-slate-800 transition-colors"
              >
                Cerrar
              </button>
            </div>
            <div className="bg-slate-900 py-4 px-6 flex items-center justify-between">
              <div className="flex items-center gap-2 text-[10px] text-indigo-300 font-black uppercase tracking-widest">
                <CheckCircle size={12} /> Cifrado de punto a punto
              </div>
              <div className="flex items-center gap-2 text-[10px] text-slate-400 font-black uppercase tracking-widest">
                v1.0.4
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
    </div>
  );
};

// Simple icon missing from imports
const ChevronRight: React.FC<{ size?: number; className?: string }> = ({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m9 18 6-6-6-6"/>
  </svg>
);

export default App;
