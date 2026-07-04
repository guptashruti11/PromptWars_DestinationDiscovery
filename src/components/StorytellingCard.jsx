import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { BookOpen, MapPin, Eye, Volume2, Sparkles, HelpCircle, Play, Pause, Square } from 'lucide-react';

/**
 * StorytellingCard Component
 * Displays GenAI heritage narratives with sensory breakdowns and interactive narration.
 * Implements WCAG 2.1 AA accessibility (ARIA roles, keyboard nav) and memoized rendering.
 */
const StorytellingCard = ({ data, onDismiss }) => {
  const [activeTab, setActiveTab] = useState('history'); // 'history' | 'culture' | 'legend'
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const synthRef = useRef(window.speechSynthesis);
  const utteranceRef = useRef(null);

  // Stop reading if component unmounts or data changes
  useEffect(() => {
    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, [data]);

  // Tab definitions
  const tabs = useMemo(() => [
    { id: 'history', label: 'History & Origins', content: data.narrative?.historicalContext },
    { id: 'culture', label: 'Cultural Roots', content: data.narrative?.culturalSignificance },
    { id: 'legend', label: 'Local Folklore', content: data.narrative?.localLegend }
  ], [data]);

  // Narrate active text using Web Speech API for maximum accessibility
  const handleNarrate = useCallback(() => {
    if (!synthRef.current) return;

    if (isSpeaking) {
      if (isPaused) {
        synthRef.current.resume();
        setIsPaused(false);
      } else {
        synthRef.current.pause();
        setIsPaused(true);
      }
      return;
    }

    const textToSpeak = `
      Title: ${data.title}. 
      Section: ${tabs.find(t => t.id === activeTab)?.label}. 
      Content: ${tabs.find(t => t.id === activeTab)?.content}
    `;

    // Cancel any active speech
    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utteranceRef.current = utterance;

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    utterance.onerror = (e) => {
      console.error("Speech Synthesis Error:", e);
      setIsSpeaking(false);
      setIsPaused(false);
    };

    setIsSpeaking(true);
    setIsPaused(false);
    synthRef.current.speak(utterance);
  }, [data, activeTab, isSpeaking, isPaused, tabs]);

  const stopNarration = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
    }
  }, []);

  return (
    <article 
      className="glass-card rounded-2xl p-6 relative overflow-hidden transition-all duration-300 hover:border-heritage-500/40 animate-fade-in-up"
      aria-labelledby="story-title"
    >
      {/* Visual background gradient glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-heritage-500/5 rounded-full blur-3xl pointer-events-none" />
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-700/60 pb-5 mb-6">
        <div>
          <div className="flex items-center gap-2 text-heritage-500 mb-1">
            <BookOpen className="w-5 h-5" aria-hidden="true" />
            <span className="text-xs font-bold uppercase tracking-wider font-display">Immersive Storyteller</span>
          </div>
          <h2 id="story-title" className="text-2xl font-extrabold text-neutral-50 font-display">
            {data.title}
          </h2>
          <div className="flex items-center gap-1.5 text-neutral-400 text-sm mt-1">
            <MapPin className="w-4 h-4 text-brand-500" aria-hidden="true" />
            <span>{data.location}</span>
          </div>
        </div>

        {/* Audio control deck */}
        <div className="flex items-center gap-2 bg-white/65 p-2 rounded-xl border border-neutral-600/25 self-start md:self-center shadow-sm">
          <button
            onClick={handleNarrate}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
              isSpeaking && !isPaused
                ? 'bg-heritage-600 text-white hover:bg-heritage-700 animate-pulse'
                : 'bg-white/80 text-neutral-200 hover:bg-white hover:text-brand-600 border border-neutral-600/20 hover:border-brand-500/30 shadow-sm'
            }`}
            aria-label={isSpeaking && !isPaused ? "Pause voice narrator" : "Listen to voice narrator"}
          >
            {isSpeaking && !isPaused ? (
              <>
                <Pause className="w-4 h-4" aria-hidden="true" />
                <span>PAUSE</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 text-heritage-500" aria-hidden="true" />
                <span>LISTEN</span>
              </>
            )}
          </button>
          
          {isSpeaking && (
            <button
              onClick={stopNarration}
              className="p-1.5 bg-white hover:bg-neutral-100 text-neutral-400 hover:text-neutral-200 border border-neutral-600/10 rounded-lg transition-colors shadow-sm"
              aria-label="Stop audio narration"
            >
              <Square className="w-4 h-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      {/* Sensory Details Section */}
      <section className="mb-8" aria-label="Sensory details">
        <h3 className="text-sm font-semibold text-neutral-300 uppercase tracking-widest font-display mb-3">
          Sensory Tapestry
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Sight */}
          <div className="bg-white/60 p-4 rounded-xl border border-neutral-600/20 flex gap-3 shadow-sm">
            <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg h-fit" aria-hidden="true">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-neutral-300 uppercase tracking-wide">Sight</h4>
              <p className="text-sm text-neutral-400 mt-1 leading-relaxed">{data.sensoryDetails?.sights}</p>
            </div>
          </div>

          {/* Sound */}
          <div className="bg-white/60 p-4 rounded-xl border border-neutral-600/20 flex gap-3 shadow-sm">
            <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-lg h-fit" aria-hidden="true">
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wide">Sound</h4>
              <p className="text-sm text-neutral-400 mt-1 leading-relaxed">{data.sensoryDetails?.sounds}</p>
            </div>
          </div>

          {/* Smell & Taste */}
          <div className="bg-white/60 p-4 rounded-xl border border-neutral-600/20 flex gap-3 shadow-sm">
            <div className="p-2 bg-amber-500/10 text-amber-600 rounded-lg h-fit" aria-hidden="true">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wide">Aroma & Taste</h4>
              <p className="text-sm text-neutral-400 mt-1 leading-relaxed">{data.sensoryDetails?.smells}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Narrative Tabbed Component */}
      <section className="mb-6" aria-label="Heritage Stories">
        {/* Tab Buttons (WCAG Tablist) */}
        <div 
          className="flex border-b border-neutral-700/50 mb-4" 
          role="tablist" 
          aria-label="Narrative Sections"
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`panel-${tab.id}`}
              id={`tab-${tab.id}`}
              tabIndex={activeTab === tab.id ? 0 : -1}
              onClick={() => {
                setActiveTab(tab.id);
                // If speaking, stop it so we don't speak outdated tabs without explicit restart
                if (isSpeaking) {
                  stopNarration();
                }
              }}
              className={`flex-1 md:flex-none px-6 py-3 text-sm font-semibold tracking-wide border-b-2 transition-all ${
                activeTab === tab.id
                  ? 'border-heritage-500 text-heritage-500 font-bold'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200 hover:border-neutral-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Panels */}
        {tabs.map((tab) => (
          <div
            key={tab.id}
            id={`panel-${tab.id}`}
            role="tabpanel"
            aria-labelledby={`tab-${tab.id}`}
            hidden={activeTab !== tab.id}
            className="focus:outline-none min-h-[140px]"
            tabIndex={0}
          >
            {activeTab === tab.id && (
              <p className="text-base text-neutral-300 leading-relaxed font-sans first-letter:text-3xl first-letter:font-extrabold first-letter:text-heritage-500 first-letter:mr-2 first-letter:float-left">
                {tab.content}
              </p>
            )}
          </div>
        ))}
      </section>

      {/* Insider Tip Drawer */}
      {data.insiderTip && (
        <footer className="mt-8 bg-heritage-50/60 p-4 rounded-xl border-l-4 border-heritage-500 border border-heritage-500/10 flex gap-3.5 shadow-sm">
          <div className="text-heritage-500 p-0.5" aria-hidden="true">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-widest text-heritage-500">
              Insider Cultural Secret
            </h4>
            <p className="text-sm text-neutral-300 mt-1 leading-relaxed italic">
              "{data.insiderTip}"
            </p>
          </div>
        </footer>
      )}
    </article>
  );
};

export default React.memo(StorytellingCard);
