import React, { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { voiceManager } from '../voice/voiceManager';

export const VoiceControls: React.FC = () => {
  const {
    currentZoneId,
    voiceStatus,
    isMicMuted,
    isSpeaking,
    focusTalkEnabled,
    voiceError,
    worldId,
    authToken,
    setVoiceError,
  } = useGameStore();

  const isFocusRoom = currentZoneId === 'focus';

  // Automatically connect to voice when entering a world with an auth token
  useEffect(() => {
    if (worldId && authToken && voiceStatus === 'disconnected') {
      voiceManager.connect(worldId, authToken);
    }
    return () => {
      // Disconnect when component unmounts
      voiceManager.disconnect();
    };
  }, [worldId, authToken]);

  // Keyboard shortcut 'M' for toggle mute
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        voiceManager.toggleMute();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="flex flex-col items-end gap-2 pointer-events-auto">
      {/* Voice Error Banner */}
      {voiceError && (
        <div className="p-2.5 px-3 bg-red-950/80 border border-red-500/50 rounded-xl text-red-200 text-xs shadow-lg backdrop-blur-sm max-w-xs flex items-center justify-between gap-2">
          <span>{voiceError}</span>
          <button
            onClick={() => setVoiceError(null)}
            className="text-red-400 hover:text-white text-xs px-1 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Focus Room Special Toggle-to-Talk Button (DEC-07) */}
      {isFocusRoom && (
        <div className="flex items-center gap-2 p-1.5 px-3 bg-slate-900/90 border border-amber-500/50 rounded-xl shadow-xl backdrop-blur-md animate-fadeIn">
          <div className="text-right">
            <span className="block text-[10px] text-amber-400 font-bold uppercase tracking-wider">
              Focus Room
            </span>
            <span className="block text-[11px] text-slate-300">
              {focusTalkEnabled ? 'Transmitting' : 'Voice Muted'}
            </span>
          </div>
          <button
            onClick={() => voiceManager.toggleFocusTalk()}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-md flex items-center gap-1.5 ${
              focusTalkEnabled
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/30'
                : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${focusTalkEnabled ? 'bg-slate-950 animate-ping' : 'bg-amber-400'}`} />
            <span>{focusTalkEnabled ? 'Stop Talking' : 'Toggle to Talk'}</span>
          </button>
        </div>
      )}

      {/* Main Voice HUD Bar */}
      <div className="flex items-center gap-2 p-2 px-3 bg-slate-900/85 border border-slate-800 rounded-xl shadow-xl backdrop-blur-md text-white">
        {/* Status Dot */}
        <div className="flex items-center gap-1.5 mr-1" title={`Voice Status: ${voiceStatus}`}>
          <span
            className={`w-2.5 h-2.5 rounded-full transition-colors ${
              voiceStatus === 'connected'
                ? isSpeaking
                  ? 'bg-emerald-400 animate-pulse'
                  : 'bg-emerald-500'
                : voiceStatus === 'connecting'
                ? 'bg-amber-400 animate-ping'
                : 'bg-slate-500'
            }`}
          />
          <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
            {voiceStatus === 'connected' ? (isSpeaking ? 'Speaking' : 'Voice Ready') : voiceStatus}
          </span>
        </div>

        {/* Microphone Toggle Button */}
        <button
          onClick={() => voiceManager.toggleMute()}
          className={`relative p-2 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
            isMicMuted
              ? 'bg-red-950/70 text-red-300 border border-red-500/40 hover:bg-red-900/80'
              : 'bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700'
          }`}
          title={isMicMuted ? 'Unmute Microphone (M)' : 'Mute Microphone (M)'}
        >
          {/* Speaking pulse ring */}
          {isSpeaking && !isMicMuted && (
            <span className="absolute inset-0 rounded-lg border-2 border-emerald-400 animate-ping opacity-75" />
          )}

          <span className="text-sm">{isMicMuted ? '🔇' : '🎙️'}</span>
          <span className="text-[11px] font-mono font-bold">
            {isMicMuted ? 'Muted' : 'Live'}
          </span>
          <span className="text-[9px] text-slate-400 bg-slate-950/60 px-1 py-0.5 rounded border border-slate-800 font-mono">
            M
          </span>
        </button>
      </div>
    </div>
  );
};

