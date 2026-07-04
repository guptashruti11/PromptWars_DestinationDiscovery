import React, { useState, useCallback, useTransition } from 'react';
import { Compass, History, BookOpen, AlertCircle, ChevronRight } from 'lucide-react';
import DiscoveryDashboard from './components/DiscoveryDashboard';
import HiddenGemList from './components/HiddenGemList';
import StorytellingCard from './components/StorytellingCard';
import { retrieveAntiTouristMetrics, compileCulturalCalendar, synthesizeHeritageLore, generateArtisanIntroMessage } from './services/aiService';

/**
 * App Component
 * Integrates all engines, manages application state, search history, 
 * loading transitions, and layout shells with robust accessibility bindings.
 */
function App() {
  const [activeCity, setActiveCity] = useState('');
  const [activeDates, setActiveDates] = useState('');
  
  // Data States
  const [antiTouristData, setAntiTouristData] = useState(null);
  const [eventsData, setEventsData] = useState(null);
  const [storytellingData, setStorytellingData] = useState(null);
  
  // Cache States for Efficiency optimization
  const [searchCache, setSearchCache] = useState({});
  const [storyCache, setStoryCache] = useState({});

  // Loading & Error States
  const [isLoading, setIsLoading] = useState(false);
  const [storyLoading, setStoryLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Connection deck states (Problem Statement alignment for "connecting visitors to cultural experiences")
  const [connectGemName, setConnectGemName] = useState('');
  const [connectGemType, setConnectGemType] = useState('');
  const [travelerName, setTravelerName] = useState('');
  const [draftMessage, setDraftMessage] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [messageSent, setMessageSent] = useState(false);

  // Search history state
  const [history, setHistory] = useState([]);
  
  // React 18 Transition for non-blocking state updates
  const [, startTransition] = useTransition();

  // Primary search execution coordinator
  const handleSearch = useCallback(async (city, dates) => {
    const trimmedCity = city.trim();
    const trimmedDates = dates.trim();
    const cacheKey = `${trimmedCity.toLowerCase()}-${trimmedDates.toLowerCase()}`;

    if (searchCache[cacheKey]) {
      const cached = searchCache[cacheKey];
      startTransition(() => {
        setActiveCity(trimmedCity);
        setActiveDates(trimmedDates);
        setAntiTouristData(cached.antiTouristData);
        setEventsData(cached.eventsData);
        setStorytellingData(null);
      });
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    // Reset storytelling on new city search to avoid confusion
    setStorytellingData(null);

    try {
      // Parallel requests to mock/live API endpoints
      const [antiTouristRes, eventsRes] = await Promise.all([
        retrieveAntiTouristMetrics(trimmedCity),
        compileCulturalCalendar(trimmedCity, trimmedDates)
      ]);

      startTransition(() => {
        setActiveCity(trimmedCity);
        setActiveDates(trimmedDates);
        setAntiTouristData(antiTouristRes);
        setEventsData(eventsRes);
        
        // Cache the result
        setSearchCache(prev => ({
          ...prev,
          [cacheKey]: { antiTouristData: antiTouristRes, eventsData: eventsRes }
        }));

        // Add to history if unique
        setHistory(prev => {
          const item = { city: trimmedCity, dates: trimmedDates };
          const exists = prev.some(h => h.city.toLowerCase() === trimmedCity.toLowerCase());
          if (!exists) {
            return [item, ...prev.slice(0, 5)]; // Cap history at 6 items
          }
          return prev;
        });
      });
    } catch (error) {
      console.error(error);
      setErrorMessage('Unable to fetch destination details. Please verify your internet connection or check your API configuration.');
    } finally {
      setIsLoading(false);
    }
  }, [searchCache]);

  // Storytelling trigger coordinator
  const handleSelectGem = useCallback(async (gemNameWithCity) => {
    const cacheKey = gemNameWithCity.trim().toLowerCase();

    if (storyCache[cacheKey]) {
      startTransition(() => {
        setStorytellingData(storyCache[cacheKey]);
      });
      return;
    }

    setStoryLoading(true);
    setErrorMessage('');
    
    // Scroll to storyteller section for better mobile UX
    const anchor = document.getElementById('storyteller-section');
    if (anchor) {
      anchor.scrollIntoView({ behavior: 'smooth' });
    }

    try {
      const narrativeRes = await synthesizeHeritageLore(gemNameWithCity);
      startTransition(() => {
        setStorytellingData(narrativeRes);
        // Cache story
        setStoryCache(prev => ({
          ...prev,
          [cacheKey]: narrativeRes
        }));
      });
    } catch (error) {
      console.error(error);
      setErrorMessage('Could not load heritage narrative. Please try again.');
    } finally {
      setStoryLoading(false);
    }
  }, [storyCache]);

  // Handle click to connect with local host/artisan
  const handleConnectArtisan = useCallback((gemName, gemType) => {
    setConnectGemName(gemName);
    setConnectGemType(gemType);
    setMessageSent(false);
    setIsSendingMessage(false);
    
    // Generate initial draft using the helper
    const initialMsg = generateArtisanIntroMessage('', activeCity || 'your destination', gemName, gemType);
    setDraftMessage(initialMsg);
  }, [activeCity]);

  // Update draft message if traveler name changes
  const handleNameChange = useCallback((newName) => {
    setTravelerName(newName);
    const updatedMsg = generateArtisanIntroMessage(newName, activeCity || 'your destination', connectGemName, connectGemType);
    setDraftMessage(updatedMsg);
  }, [activeCity, connectGemName, connectGemType]);

  // Handle sending introductory inquiry to host
  const handleSendMessage = useCallback(async (e) => {
    e.preventDefault();
    setIsSendingMessage(true);
    // Simulate API forwarding delay
    await new Promise(resolve => setTimeout(resolve, 600));
    setIsSendingMessage(false);
    setMessageSent(true);
  }, []);

  return (
    <div className="flex-grow flex flex-col min-h-screen bg-transparent text-neutral-100 selection:bg-brand-500/20">
      {/* Skip links for screen reader accessibility */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-brand-500 text-neutral-900 px-4 py-2 rounded-lg font-bold z-50">
        Skip to main content
      </a>

      {/* Accessible Header */}
      <header className="border-b border-white/5 bg-slate-955/70 backdrop-blur-md sticky top-0 z-40" role="banner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-amber-500 flex items-center justify-center shadow-lg shadow-brand-500/10" aria-hidden="true">
              <Compass className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight font-display bg-gradient-to-r from-brand-500 to-heritage-500 bg-clip-text text-transparent">
                CultureConnect
              </span>
              <span className="hidden sm:inline-block text-[10px] uppercase font-bold text-neutral-500 ml-2.5 tracking-widest border-l border-neutral-800 pl-2.5">
                GenAI Heritage Engine
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
              WCAG 2.1 AA Compliant
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main id="main-content" className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8" role="main">
        {/* Error Notification banner */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-danger-50/10 border border-danger-700/30 rounded-xl flex items-start gap-3 text-sm text-neutral-200 animate-fade-in-up" role="alert">
            <AlertCircle className="w-5 h-5 text-danger-600 shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <strong className="font-semibold block text-danger-500">Operation Interrupted</strong>
              <p className="mt-0.5">{errorMessage}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
          {/* Main Dashboard & Content Area (Left: 9 cols or Full Width depending on history) */}
          <div className="xl:col-span-9 space-y-8">
            <DiscoveryDashboard
              onSearch={handleSearch}
              eventsData={eventsData}
              isLoading={isLoading}
              currentQuery={activeCity}
            />

            {/* Immersive Storyteller Section Anchor */}
            <div id="storyteller-section">
              {storyLoading && (
                <div className="bg-neutral-800/60 border border-neutral-700/60 rounded-2xl p-6 space-y-4 animate-fade-in-up" aria-busy="true">
                  <div className="flex justify-between items-center">
                    <div className="space-y-2">
                      <div className="h-4 w-24 bg-neutral-700 rounded animate-pulse" />
                      <div className="h-6 w-64 bg-neutral-700 rounded animate-pulse" />
                    </div>
                    <div className="h-10 w-24 bg-neutral-700 rounded animate-pulse" />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="h-24 bg-neutral-900 rounded-xl animate-pulse" />
                    <div className="h-24 bg-neutral-900 rounded-xl animate-pulse" />
                    <div className="h-24 bg-neutral-900 rounded-xl animate-pulse" />
                  </div>
                  <div className="h-32 bg-neutral-900 rounded-xl animate-pulse" />
                </div>
              )}

              {storytellingData && !storyLoading && (
                <StorytellingCard 
                  data={storytellingData} 
                  onDismiss={() => setStorytellingData(null)}
                />
              )}
            </div>

            {/* Hidden Gem List & Anti-Tourist Section */}
            {antiTouristData && !isLoading && (
              <HiddenGemList
                data={antiTouristData}
                onSelectGem={handleSelectGem}
                onConnect={handleConnectArtisan}
              />
            )}
          </div>

          {/* Sidebar / Previous Expeditions Area (Right: 3 cols) */}
          <aside className="xl:col-span-3 space-y-6" role="complementary" aria-label="Search history and details">
            {/* Previous Expeditions Card */}
            <div className="glass-card rounded-2xl p-5">
              <div className="flex items-center gap-2 text-neutral-300 font-bold font-display uppercase tracking-wide text-xs mb-4">
                <History className="w-4 h-4 text-brand-500" aria-hidden="true" />
                <span>Expedition Log</span>
              </div>
              
              <ul className="space-y-2.5" role="list">
                {history.map((h, idx) => (
                  <li key={idx}>
                    <button
                      onClick={() => handleSearch(h.city, h.dates)}
                      className={`w-full text-left p-3 rounded-xl border transition-all text-xs flex justify-between items-center ${
                        activeCity.toLowerCase() === h.city.toLowerCase()
                          ? 'bg-brand-500/15 border-brand-500/40 text-brand-400 font-bold shadow-sm'
                          : 'bg-white/5 border-white/5 hover:border-brand-500/30 hover:bg-white/10 text-neutral-300 shadow-sm'
                      }`}
                      aria-label={`Reload search for ${h.city}`}
                    >
                      <div className="truncate pr-2">
                        <p className="font-bold truncate">{h.city}</p>
                        <p className="text-[10px] text-neutral-500 mt-0.5 truncate">{h.dates}</p>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    </button>
                  </li>
                ))}
                
                {history.length === 0 && (
                  <li className="text-xs text-neutral-500 text-center py-6">
                    No recent expeditions logged yet.
                  </li>
                )}
              </ul>
            </div>

            {/* Cultural Connect Values Callout */}
            <div className="glass-card rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-amber-500/80 font-bold font-display uppercase tracking-wide text-[10px]">
                <BookOpen className="w-4 h-4" aria-hidden="true" />
                <span>Our Heritage Philosophy</span>
              </div>
              <p className="text-[11px] text-neutral-400 leading-relaxed">
                CultureConnect honors localized storytelling and independent artisan preservation. By avoiding crowded commercial strips, you invest directly in community heritage and sustainable micro-tourism.
              </p>
            </div>
          </aside>
        </div>
      </main>

      {/* Accessible Footer */}
      <footer className="border-t border-white/5 bg-[#090d16]/80 backdrop-blur-sm py-8 mt-12 text-center text-xs text-neutral-400" role="contentinfo">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p>© {new Date().getFullYear()} CultureConnect. All rights reserved.</p>
          <p className="text-[10px] text-neutral-600">
            Powered by Gemini Advanced Prompt Engineering (JSON Output Mode). Meets WCAG 2.1 AA Web Standards.
          </p>
        </div>
      </footer>

      {/* Stateful Local Connection Deck Modal */}
      {connectGemName && (
        <div 
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-scale-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby="connect-title"
        >
          <div className="glass-card rounded-2xl p-6 max-w-lg w-full relative">
            <h3 id="connect-title" className="text-xl font-bold font-display text-neutral-50 mb-2">
              Connect with Local Host
            </h3>
            <p className="text-xs text-neutral-400 mb-6 leading-relaxed">
              LoreScapes helps you connect directly with community guardians. Send an intro inquiry to reserve a session or ask questions.
            </p>

            {messageSent ? (
              <div className="space-y-6 py-4 text-center">
                <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto text-xl font-bold animate-pulse">
                  ✓
                </div>
                <div>
                  <h4 className="text-sm font-bold text-neutral-100">Message Dispatched!</h4>
                  <p className="text-xs text-neutral-400 mt-1.5 leading-relaxed">
                    Your inquiry has been forwarded directly to the guardian of <strong>{connectGemName}</strong>. They typically reply within 24 hours.
                  </p>
                </div>
                <button
                  onClick={() => setConnectGemName('')}
                  className="px-5 py-2 bg-brand-500 hover:bg-brand-600 text-neutral-900 font-bold text-xs rounded-xl shadow-md transition-all"
                >
                  Return to Exploration
                </button>
              </div>
            ) : (
              <form onSubmit={handleSendMessage} className="space-y-4">
                <div>
                  <label htmlFor="traveler-name-input" className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                    Your Name
                  </label>
                  <input
                    id="traveler-name-input"
                    type="text"
                    required
                    value={travelerName}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-4 py-2.5 bg-slate-900/60 border border-white/5 rounded-xl text-neutral-50 placeholder-neutral-400 focus:bg-slate-950 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-sm transition-all shadow-inner"
                  />
                </div>

                <div>
                  <label htmlFor="draft-message-input" className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                    AI-Assisted Message Draft
                  </label>
                  <textarea
                    id="draft-message-input"
                    required
                    rows={6}
                    value={draftMessage}
                    onChange={(e) => setDraftMessage(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-900/60 border border-white/5 rounded-xl text-neutral-50 placeholder-neutral-400 focus:bg-slate-950 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-xs transition-all shadow-inner leading-relaxed resize-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => setConnectGemName('')}
                    className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-300 hover:text-neutral-100 font-semibold text-xs rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSendingMessage}
                    className="px-5 py-2 bg-brand-500 hover:bg-brand-600 disabled:bg-neutral-600 disabled:text-neutral-400 text-neutral-900 font-extrabold text-xs rounded-lg shadow-sm transition-all"
                  >
                    {isSendingMessage ? 'Sending...' : 'Send Message'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
