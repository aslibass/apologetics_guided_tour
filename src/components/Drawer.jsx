import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldAlert, ShieldCheck } from 'lucide-react';

export function Drawer({ isOpen, onClose, data, showPresenterNotes }) {
  // Close on ESC mapping
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <AnimatePresence>
      {isOpen && data && (
        <>
          {/* Removed full screen backdrop so the React Flow dimming logic works natively keeping the active node sharp */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-transparent"
          />
          
          {/* Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 z-50 h-full w-full sm:w-[500px] border-l bg-background p-6 shadow-2xl overflow-y-auto"
          >
            <div className="flex items-start justify-between mb-8">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1 uppercase tracking-wider">
                  {data.category}
                </p>
                <h2 className="text-2xl font-bold tracking-tight text-foreground">{data.label}</h2>
              </div>
              <button
                onClick={onClose}
                className="rounded-full p-2 hover:bg-muted text-muted-foreground transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="prose prose-sm sm:prose-base dark:prose-invert">
              <p className="text-lg leading-relaxed text-muted-foreground mb-6 font-medium">
                {data.summary}
              </p>
              
              <div className="h-px w-full bg-border mb-6" />

              <div className="space-y-8">
                {/* Public Summary Bullets */}
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-foreground mb-3">Key Concepts</h3>
                  <ul className="list-disc pl-5 space-y-2 text-foreground/90">
                    {data.publicSummary ? data.publicSummary.map((point, i) => (
                      <li key={i}>{point}</li>
                    )) : <li>{data.fullText}</li> /* Fallback for old data */}
                  </ul>
                </div>

                {/* Skeptic Pushback */}
                {data.skepticPushback && (
                  <div className="bg-red-500/5 dark:bg-red-500/10 p-4 rounded-xl border border-red-500/20">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-red-700 dark:text-red-400 mb-2 flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4" /> Skeptical Pushback
                    </h3>
                    <p className="text-sm text-red-900/80 dark:text-red-300/80 leading-relaxed italic">
                      "{data.skepticPushback}"
                    </p>
                  </div>
                )}

                {/* Historical Defense */}
                {data.historicalDefense && (
                  <div className="bg-emerald-500/5 dark:bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/20">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-2 flex items-center gap-2">
                       <ShieldCheck className="w-4 h-4" /> Historical Defense
                    </h3>
                    <p className="text-sm text-emerald-900/80 dark:text-emerald-300/80 leading-relaxed">
                      {data.historicalDefense}
                    </p>
                  </div>
                )}

                {/* Presenter Notes (Conditional on Presenter Mode) */}
                {showPresenterNotes && data.presenterNotes && (
                  <div className="bg-amber-500/5 dark:bg-amber-500/10 p-4 rounded-xl border border-amber-500/20 mt-6">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 mb-2 flex items-center gap-2">
                       Presenter Notes <span className="bg-amber-500/20 text-amber-800 dark:text-amber-200 text-[10px] px-2 py-0.5 rounded-full">Private</span>
                    </h3>
                    <p className="text-sm text-amber-900/80 dark:text-amber-300/80 leading-relaxed italic">
                      "{data.presenterNotes}"
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            {(data.category === 'objection') && (
              <div className="mt-8 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-sm font-semibold text-red-600 dark:text-red-400">
                  Critical Objection Focus
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  This node represents an active skeptical challenge to the core premise.
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
