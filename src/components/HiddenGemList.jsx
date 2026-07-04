import React, { useMemo, useCallback } from 'react';
import { AlertOctagon, Compass, MapPin, Sparkles, ChevronRight, Info } from 'lucide-react';

/**
 * HiddenGemList Component
 * Renders the Anti-Tourist analysis: traps side-by-side with authentic artisan locations.
 * Includes interactive navigation to trigger storytelling narratives.
 */
const HiddenGemList = ({ data, onSelectGem }) => {
  const traps = useMemo(() => data.touristTraps || [], [data]);
  const gems = useMemo(() => data.hiddenGems || [], [data]);

  // Callback to handle gem selection
  const handleSelect = useCallback((gemName) => {
    if (onSelectGem) {
      onSelectGem(`${gemName}, ${data.city}`);
    }
  }, [data.city, onSelectGem]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in-up">
      
      {/* COLUMN 1: Tourist Traps to Skip (Left, 5 cols) */}
      <section 
        className="lg:col-span-5 bg-neutral-800/40 border border-neutral-700/40 rounded-2xl p-6 h-fit"
        aria-labelledby="traps-heading"
      >
        <div className="flex items-center gap-2 text-danger-600 mb-4">
          <AlertOctagon className="w-5 h-5" aria-hidden="true" />
          <h3 id="traps-heading" className="text-lg font-bold font-display uppercase tracking-wide">
            Tourist Traps to Limit/Avoid
          </h3>
        </div>
        
        <p className="text-xs text-neutral-400 mb-6 leading-relaxed">
          Overcrowded, commercialized, or overpriced. Consider skipping these or finding alternatives:
        </p>

        <ul className="space-y-4" role="list">
          {traps.map((trap, index) => (
            <li 
              key={index} 
              className="bg-neutral-900/60 p-4 rounded-xl border border-neutral-800 hover:border-danger-700/20 transition-colors"
            >
              <div className="flex items-start gap-3">
                <span className="flex items-center justify-center w-5 h-5 bg-danger-600/10 text-danger-600 rounded-full font-bold text-xs mt-0.5" aria-hidden="true">
                  {index + 1}
                </span>
                <div>
                  <h4 className="text-sm font-bold text-neutral-200">{trap.name}</h4>
                  <p className="text-xs text-neutral-400 mt-1.5 leading-relaxed">
                    {trap.reason}
                  </p>
                </div>
              </div>
            </li>
          ))}
          {traps.length === 0 && (
            <li className="text-sm text-neutral-500 py-4 text-center">No tourist traps analyzed.</li>
          )}
        </ul>
      </section>

      {/* COLUMN 2: Authentic Hidden Gems (Right, 7 cols) */}
      <section 
        className="lg:col-span-7 bg-neutral-800 border border-neutral-700/60 rounded-2xl p-6 shadow-lg"
        aria-labelledby="gems-heading"
      >
        <div className="flex items-center justify-between border-b border-neutral-700/50 pb-4 mb-6">
          <div className="flex items-center gap-2 text-brand-500">
            <Compass className="w-5 h-5" aria-hidden="true" />
            <h3 id="gems-heading" className="text-lg font-extrabold font-display uppercase tracking-wide">
              Local Artisan & Hidden Gems
            </h3>
          </div>
          <span className="text-xs px-2.5 py-1 bg-brand-500/10 text-brand-500 rounded-full font-bold border border-brand-500/25">
            {gems.length} Spots Identified
          </span>
        </div>

        <ul className="space-y-5" role="list">
          {gems.map((gem, index) => (
            <li 
              key={index}
              className="group bg-neutral-900/40 hover:bg-neutral-900/80 p-5 rounded-xl border border-neutral-700/30 hover:border-brand-500/30 transition-all duration-300 relative"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex-1">
                  {/* Gem Type Tag */}
                  <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-brand-500 bg-brand-500/10 px-2 py-0.5 rounded border border-brand-500/20 mb-2">
                    {gem.type}
                  </span>
                  
                  <h4 className="text-base font-extrabold text-neutral-100 group-hover:text-brand-500 transition-colors">
                    {gem.name}
                  </h4>
                  
                  {/* Description */}
                  <p className="text-sm text-neutral-300 mt-2 leading-relaxed">
                    {gem.description}
                  </p>
                  
                  {/* Metadata: Location and Vibe */}
                  <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4 pt-3 border-t border-neutral-800/80 text-xs">
                    <span className="flex items-center gap-1 text-neutral-400">
                      <MapPin className="w-3.5 h-3.5 text-neutral-500" aria-hidden="true" />
                      {gem.location}
                    </span>
                    <span className="flex items-center gap-1 text-neutral-400">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" aria-hidden="true" />
                      Vibe: <strong className="text-neutral-300 font-semibold">{gem.vibe}</strong>
                    </span>
                  </div>
                </div>

                {/* Narrative Action Button */}
                <button
                  onClick={() => handleSelect(gem.name)}
                  className="flex items-center justify-center gap-1.5 self-end md:self-start bg-neutral-800 hover:bg-brand-500 hover:text-white text-neutral-300 font-bold text-xs py-2 px-3.5 rounded-lg border border-neutral-700/80 hover:border-transparent transition-all group/btn shadow-sm"
                  aria-label={`Listen to historical story about ${gem.name}`}
                >
                  <span>Story</span>
                  <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-1" aria-hidden="true" />
                </button>
              </div>
            </li>
          ))}
          {gems.length === 0 && (
            <li className="text-sm text-neutral-500 py-8 text-center">No hidden gems found.</li>
          )}
        </ul>
      </section>
    </div>
  );
};

export default React.memo(HiddenGemList);
