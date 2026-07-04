import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Search, Calendar, Settings, X, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';
import { getApiKey, saveApiKey } from '../services/aiService';

/**
 * DiscoveryDashboard Component
 * The main search control, API configuration panel, and simulated Event Surface.
 */
const DiscoveryDashboard = ({
  onSearch,
  eventsData,
  isLoading,
  currentQuery
}) => {
  const [cityInput, setCityInput] = useState('');
  const [datesInput, setDatesInput] = useState('');
  const [dateInputType, setDateInputType] = useState('text');
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState(getApiKey());
  const [keySavedMessage, setKeySavedMessage] = useState(false);

  // Sync inputs with currentQuery when it changes (e.g. from history logs)
  useEffect(() => {
    if (currentQuery) {
      setCityInput(currentQuery);
    }
  }, [currentQuery]);

  // Suggested quick-search locations
  const suggestions = useMemo(() => [
    { city: 'Tokyo', dates: 'May 12 - May 20' },
    { city: 'Paris', dates: 'June 18 - June 25' },
    { city: 'Rome', dates: 'September 5 - September 12' }
  ], []);

  // Handle Search Trigger
  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    if (!cityInput.trim()) return;
    onSearch(cityInput.trim(), datesInput.trim() || 'Autumn Season');
  }, [cityInput, datesInput, onSearch]);

  // Handle suggested searches
  const handleSuggestionClick = useCallback((city, dates) => {
    setCityInput(city);
    setDatesInput(dates);
    setDateInputType('text');
    onSearch(city, dates);
  }, [onSearch]);

  // Save API Key
  const handleSaveKey = useCallback((e) => {
    e.preventDefault();
    saveApiKey(apiKey);
    setKeySavedMessage(true);
    setTimeout(() => {
      setKeySavedMessage(false);
      setShowSettings(false);
    }, 1500);
  }, [apiKey]);

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Top Banner & Control Deck */}
      <section className="glass-card rounded-2xl p-6 relative overflow-hidden" aria-label="Search controls">
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex justify-between items-start gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-neutral-50 font-display tracking-tight">
              Uncover Authentic Culture
            </h1>
            <p className="text-neutral-300 text-sm mt-1 leading-relaxed">
              Bypass commercialized traps. Find true neighborhood heritage and artisan creations.
            </p>
          </div>

          {/* Settings / API Key Button */}
          <button
            onClick={() => setShowSettings(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/70 hover:bg-white border border-neutral-600/30 hover:border-brand-500 rounded-lg text-xs font-bold text-brand-700 hover:text-brand-600 shadow-sm transition-all"
            aria-label="API Settings"
            aria-haspopup="dialog"
          >
            <Settings className="w-4 h-4" />
            <span>API CONFIG</span>
          </button>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-5 relative">
            <label htmlFor="city-input" className="sr-only">Destination City</label>
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
              <Search className="w-5 h-5" />
            </div>
            <input
              id="city-input"
              type="text"
              required
              value={cityInput}
              onChange={(e) => setCityInput(e.target.value)}
              placeholder="Enter destination (e.g. Tokyo, Paris, Rome)"
              className="w-full pl-11 pr-4 py-3 bg-white/80 border border-neutral-600/30 rounded-xl text-slate-900 placeholder-neutral-400 focus:bg-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-sm transition-all shadow-inner"
            />
          </div>

          <div className="md:col-span-4 relative">
            <label htmlFor="dates-input" className="sr-only">Travel Dates</label>
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
              <Calendar className="w-5 h-5" />
            </div>
            <input
              id="dates-input"
              type={dateInputType}
              onFocus={() => setDateInputType('date')}
              onBlur={() => { if (!datesInput) setDateInputType('text'); }}
              value={datesInput}
              onChange={(e) => setDatesInput(e.target.value)}
              placeholder="Travel Dates (e.g. May 10 - May 20)"
              className="w-full pl-11 pr-4 py-3 bg-white/80 border border-neutral-600/30 rounded-xl text-slate-900 placeholder-neutral-400 focus:bg-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-sm transition-all shadow-inner"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="md:col-span-3 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 disabled:from-neutral-600 disabled:to-neutral-700 disabled:text-neutral-400 text-neutral-900 font-extrabold text-sm py-3 px-6 rounded-xl transition-all shadow-md shadow-brand-500/20 hover:shadow-lg hover:shadow-brand-500/30 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" aria-hidden="true" />
                <span>Consulting AI...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" aria-hidden="true" />
                <span>GENERATE GUIDE</span>
              </>
            )}
          </button>
        </form>

        {/* Suggestion tags */}
        <div className="flex flex-wrap items-center gap-2 mt-5 text-xs">
          <span className="text-neutral-400 font-semibold uppercase tracking-wider">Curated suggestions:</span>
          {suggestions.map((s, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSuggestionClick(s.city, s.dates)}
              className="px-3 py-1 bg-white/60 border border-neutral-600/20 rounded-full text-neutral-200 hover:bg-white hover:border-brand-500 hover:text-brand-500 shadow-sm transition-all focus:ring-1 focus:ring-brand-500"
            >
              {s.city} ({s.dates})
            </button>
          ))}
        </div>
      </section>

      {/* Settings Modal (Accessible dialog overlay) */}
      {showSettings && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all"
          role="dialog"
          aria-modal="true"
          aria-labelledby="settings-title"
        >
          <div className="glass-card rounded-2xl w-full max-w-md p-6 relative shadow-2xl animate-scale-in">
            <button
              onClick={() => setShowSettings(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-200 p-1 rounded-lg focus:ring-1"
              aria-label="Close API configuration"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 id="settings-title" className="text-lg font-bold font-display text-neutral-50 mb-1 flex items-center gap-2">
              <Settings className="w-5 h-5 text-brand-500" />
              API Key Configurations
            </h2>
            
            <p className="text-xs text-neutral-400 mb-5 leading-relaxed">
              CultureConnect works out-of-the-box using simulated local datasets. Paste a Gemini API Key to enable real-time live LLM generations.
            </p>

            <form onSubmit={handleSaveKey} className="space-y-4">
              <div>
                <label htmlFor="gemini-key-input" className="block text-xs font-bold text-neutral-300 mb-1.5 uppercase tracking-wide">
                  Gemini API Key
                </label>
                <input
                  id="gemini-key-input"
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your Gemini API Key"
                  className="w-full px-3 py-2 bg-white border border-neutral-600/30 rounded-lg text-slate-900 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 shadow-inner"
                />
              </div>

              {/* Status display */}
              <div className="p-3 bg-white/40 rounded-xl border border-neutral-600/25 text-xs flex gap-2 shadow-sm">
                {apiKey ? (
                  <>
                    <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500 shrink-0" />
                    <div>
                      <strong className="text-emerald-500 font-semibold">Live Mode Configured</strong>
                      <p className="text-neutral-400 mt-0.5">Requests will call Google's GenAI model.</p>
                    </div>
                  </>
                ) : (
                  <>
                    <ShieldAlert className="w-4.5 h-4.5 text-amber-500 shrink-0" />
                    <div>
                      <strong className="text-amber-500 font-semibold">Offline Sandbox Mode</strong>
                      <p className="text-neutral-400 mt-0.5">Using high-fidelity mockup database fallbacks.</p>
                    </div>
                  </>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-neutral-700/55">
                <button
                  type="button"
                  onClick={() => setShowSettings(false)}
                  className="px-4 py-2 bg-neutral-600 hover:bg-neutral-500 rounded-lg text-xs font-semibold text-neutral-200 shadow-sm transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-neutral-900 rounded-lg text-xs font-extrabold flex items-center gap-1.5"
                >
                  {keySavedMessage ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>SAVED</span>
                    </>
                  ) : (
                    <span>SAVE KEY</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dynamic Event Surface (Suggested Events) */}
      {eventsData && (
        <section className="glass-card rounded-2xl p-6 shadow-lg animate-fade-in-up" aria-labelledby="events-heading">
          <div className="flex items-center gap-2 text-brand-500 border-b border-neutral-700/50 pb-4 mb-5">
            <Calendar className="w-5 h-5" aria-hidden="true" />
            <h3 id="events-heading" className="text-lg font-bold font-display uppercase tracking-wide">
              Dynamic Event Surface
            </h3>
            <span className="text-xs bg-brand-500/10 text-brand-500 px-2 py-0.5 rounded font-semibold border border-brand-500/20 ml-auto">
              {eventsData.dateRange}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(eventsData.events || []).map((evt) => (
              <div
                key={evt.id}
                className="bg-white/50 hover:bg-white p-5 rounded-xl border border-neutral-600/20 hover:border-brand-500/35 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-500 bg-brand-500/10 px-2 py-0.5 rounded border border-brand-500/20">
                      {evt.type}
                    </span>
                    <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      {evt.vibe}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-neutral-100 mb-1">{evt.title}</h4>
                  <p className="text-xs text-brand-500 font-semibold mb-2">{evt.date}</p>
                  <p className="text-xs text-neutral-300 leading-relaxed mb-4">{evt.description}</p>
                </div>

                <div className="pt-3 border-t border-neutral-800/80 mt-auto">
                  <span className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1">
                    CULTURAL ANCHOR
                  </span>
                  <p className="text-[11px] text-neutral-400 italic">
                    "{evt.culturalRoot}"
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Loading Skeletons */}
      {isLoading && (
        <div className="space-y-6" aria-live="polite" aria-busy="true">
          {/* Skeleton for Events */}
          <div className="bg-neutral-800/60 border border-neutral-700/60 rounded-2xl p-6 space-y-4">
            <div className="h-6 w-48 bg-neutral-700/40 rounded animate-pulse" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div key={n} className="bg-neutral-900/40 p-5 rounded-xl border border-neutral-800/60 space-y-3">
                  <div className="flex justify-between">
                    <div className="h-4 w-16 bg-neutral-800 rounded animate-pulse" />
                    <div className="h-4 w-12 bg-neutral-800 rounded animate-pulse" />
                  </div>
                  <div className="h-5 w-3/4 bg-neutral-800 rounded animate-pulse" />
                  <div className="h-3 w-1/4 bg-neutral-800 rounded animate-pulse" />
                  <div className="space-y-1">
                    <div className="h-3 w-full bg-neutral-800 rounded animate-pulse" />
                    <div className="h-3 w-5/6 bg-neutral-800 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Skeleton for Side-by-Side Content */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 bg-neutral-800/60 rounded-2xl p-6 space-y-4 h-96">
              <div className="h-6 w-36 bg-neutral-700/40 rounded animate-pulse" />
              <div className="space-y-3">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-20 bg-neutral-900/50 rounded-xl animate-pulse" />
                ))}
              </div>
            </div>
            <div className="lg:col-span-7 bg-neutral-800/60 rounded-2xl p-6 space-y-4 h-96">
              <div className="h-6 w-48 bg-neutral-700/40 rounded animate-pulse" />
              <div className="space-y-4">
                {[1, 2].map((n) => (
                  <div key={n} className="h-28 bg-neutral-900/50 rounded-xl animate-pulse" />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(DiscoveryDashboard);
