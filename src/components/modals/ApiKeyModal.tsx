import React, { useState } from 'react';
import {
  getStoredApiKey,
  setStoredApiKey,
  getStoredModel,
  setStoredModel,
  SUPPORTED_MODELS,
  testApiKeyConnection,
} from '../../services/geminiService';
import { X, Key, Sparkles, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, onSaved }) => {
  const [keyInput, setKeyInput] = useState(getStoredApiKey());
  const [modelInput, setModelInput] = useState(getStoredModel());
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setStoredApiKey(keyInput);
    setStoredModel(modelInput);

    if (keyInput.trim()) {
      setTesting(true);
      const res = await testApiKeyConnection(keyInput, modelInput);
      setTestResult(res);
      setTesting(false);
      onSaved();
      if (res.success) {
        setTimeout(() => {
          onClose();
        }, 800);
      }
    } else {
      setTestResult({
        success: true,
        message: 'Saved in High-Fidelity Demo Engine mode (No API Key required).',
      });
      setTimeout(() => {
        onSaved();
        onClose();
      }, 800);
    }
  };

  const handleClear = () => {
    setStoredApiKey('');
    setKeyInput('');
    setTestResult({ success: true, message: 'API key cleared. Reverted to built-in AI demo engine.' });
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#09090b]/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#121215] border border-[#27272a] max-w-md w-full p-6 sm:p-7 rounded-2xl flex flex-col gap-5 shadow-2xl relative">
        <div className="flex items-center justify-between border-b border-[#27272a] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#a78bfa]/15 text-[#a78bfa] border border-[#a78bfa]/30">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#fafafa]">Google Gemini Settings</h3>
              <p className="text-xs text-[#a1a1aa] font-mono">Model Configuration & Credentials</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#a1a1aa] hover:text-[#fafafa] hover:bg-[#18181b] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-mono text-[#a1a1aa] block mb-1">
              Gemini API Key
            </label>
            <input
              type="password"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder="Paste AI Studio Key (e.g. AIzaSy...)"
              className="w-full bg-[#18181b] border border-[#27272a] text-sm text-[#fafafa] px-3.5 py-2.5 rounded-xl focus:border-[#a78bfa] outline-none font-mono"
            />
            <p className="text-[11px] text-[#71717a] font-mono mt-1">
              Leave blank to run with Evento.AI's intelligent local generative engine.
            </p>
          </div>

          <div>
            <label className="text-xs font-mono text-[#a1a1aa] block mb-1">
              Model Engine
            </label>
            <select
              value={modelInput}
              onChange={(e) => setModelInput(e.target.value)}
              className="w-full bg-[#18181b] border border-[#27272a] text-sm text-[#fafafa] px-3.5 py-2.5 rounded-xl focus:border-[#a78bfa] outline-none cursor-pointer"
            >
              {SUPPORTED_MODELS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          <div className="p-3 rounded-xl bg-[#18181b] border border-[#27272a] text-xs text-[#a1a1aa] flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-[#34d399] flex-shrink-0 mt-0.5" />
            <span>
              <strong>Security Protocol:</strong> Your key is stored solely in local client storage with TLS direct calls to Google Generative Language endpoints.
            </span>
          </div>

          {testResult && (
            <div
              className={`p-3 rounded-xl border text-xs font-mono flex flex-col gap-2 ${
                testResult.success
                  ? 'bg-[#34d399]/10 border-[#34d399]/30 text-[#34d399]'
                  : 'bg-[#ef4444]/10 border-[#ef4444]/30 text-[#ef4444]'
              }`}
            >
              <div className="flex items-start gap-2">
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                )}
                <span>{testResult.message}</span>
              </div>
              {!testResult.success && (
                <button
                  type="button"
                  onClick={() => {
                    onSaved();
                    onClose();
                  }}
                  className="self-start text-[11px] underline text-[#fafafa] hover:text-[#a78bfa] cursor-pointer mt-0.5"
                >
                  Continue to Workspace with Saved Key →
                </button>
              )}
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-[#27272a]">
            {keyInput ? (
              <button
                type="button"
                onClick={handleClear}
                className="text-xs font-mono text-[#ef4444] hover:underline cursor-pointer"
              >
                Clear Key
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-[#18181b] hover:bg-[#1e1e22] text-xs font-mono text-[#a1a1aa] hover:text-[#fafafa] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={testing}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#a78bfa] hover:bg-[#c4b5fd] text-xs font-semibold text-[#0a0012] cursor-pointer shadow-md shadow-[#a78bfa]/20 active:scale-95"
              >
                <Sparkles className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
                <span>{testing ? 'Verifying...' : 'Save & Connect'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
