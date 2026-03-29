import React from 'react';
import { X, BookOpen, Navigation } from 'lucide-react';

export function AboutModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-card border border-border rounded-xl shadow-2xl p-8 animate-in fade-in zoom-in-95 duration-200">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold mb-6 text-foreground">Resurrection: The Evidence Map</h2>

        <div className="space-y-8 text-muted-foreground">
          {/* Instructions Section */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Navigation className="w-5 h-5 text-primary" />
              Navigating the Evidence
            </h3>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li><strong className="text-foreground">Start at the Macro View:</strong> The application launches with 6 main logical "Hubs" (Worldview, Tomb, Eyewitnesses, History, Morality, Evil).</li>
              <li><strong className="text-foreground">Follow the Dialogue:</strong> The map uses cascading 'Socratic Chains'. Follow the paths outward from Historical Facts → Skeptical Objections → Logical Refutations. Click any node to open its Side Drawer for a deep dive into counter-arguments.</li>
              <li><strong className="text-foreground">Take a Guided Tour:</strong> Select a tour from the top navigation to experience an automated journey through the arguments, perfect for learning the flow of the debate.</li>
              <li><strong className="text-foreground">Presenter Mode:</strong> Toggle the 'Eye' icon in the top header to reveal deep academic references inside the side drawer, specifically designed to stay hidden from general audiences but available for speakers on stage.</li>
            </ul>
          </section>

          <hr className="border-border" />

          {/* Sources Section */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              Academic Sources & Bibliography
            </h3>
            <p className="text-sm">
              The claims, facts, and logic modeled in this causal loop diagram are synthesized from leading peer-reviewed historical Jesus scholarship. Primary sources include:
            </p>
            <div className="space-y-3 mt-4 text-sm">
              <div className="p-3 bg-muted/30 rounded-lg border border-border">
                <span className="font-semibold text-foreground">Gary R. Habermas</span> - <em>The Historical Jesus: Ancient Evidence for the Life of Christ</em>
                <p className="text-xs mt-1">Foundational source for the "Minimal Facts" approach utilized heavily in the Tomb and Appearances subsystems.</p>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg border border-border">
                <span className="font-semibold text-foreground">William Lane Craig</span> - <em>Reasonable Faith: Christian Truth and Apologetics</em>
                <p className="text-xs mt-1">Informs the structural arguments surrounding the Empty Tomb, Conspiracy, and Wrong Tomb theories.</p>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg border border-border">
                <span className="font-semibold text-foreground">Michael R. Licona</span> - <em>The Resurrection of Jesus: A New Historiographical Approach</em>
                <p className="text-xs mt-1">Provides the robust refutation parameters for Hallucination and Cognitive Dissonance theories.</p>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg border border-border">
                <span className="font-semibold text-foreground">N.T. Wright</span> - <em>The Resurrection of the Son of God</em>
                <p className="text-xs mt-1">Examines the 1st-century Jewish context, ensuring our models of Dissonance don't violate anachronistic theological assumptions.</p>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg border border-border">
                <span className="font-semibold text-foreground">J. Warner Wallace</span> - <em>Cold-Case Christianity</em>
                <p className="text-xs mt-1">Supplies the legal and forensic logic used to dismantle the "Telephone Game"/Legend theories and witness reliability.</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
