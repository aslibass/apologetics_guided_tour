# Resurrection: The Evidence Map

A high-performance, interactive React web application designed to visually map out the logical, historical, and philosophical flow of Christian Apologetics. 

Built with **React Flow**, **Tailwind CSS v4** (Dark Mode), and **Framer Motion**, this educational "Guided Discovery" tool allows users to explore the causal links between historical evidence, skeptical objections, and logical refutations through interactive, cascading Socratic dialogs.

## 🗺️ The Architecture (53-Node Map)

Unlike traditional "spider-web" mind maps, The Evidence Map uses a custom **BFS (Breadth-First Search) Radial Tree Layout**. Nodes branch outward in strict chronological and logical sequences: `Hub → Entry Fact → Objection 1 → Refutation 1 → Objection 2 → Refutation 2...`.

The application is logically structured into 6 main philosophical and historical hubs:

### 1. Worldview & The Cross
Establishes the philosophical plausibility of God (Kalam Cosmological Argument, Fine-Tuning) and the historical bedrock certainty of Jesus's death by Roman execution, defeating arguments like the "Swoon Theory."

### 2. The Empty Tomb
Examines the physical evidence in Jerusalem. Traces the burial by Joseph of Arimathea, the existence of the Roman Guard, and definitively refutes both the "Stolen Body" and "Wrong Tomb" theories.

### 3. The Eyewitnesses
Explores the psychological data. Addresses the radical, instant transformation of the disciples, the physical nature of the appearances (eating, touching), and scientifically dismantles the "Mass Hallucination" and "Cognitive Dissonance" theories.

### 4. History vs. Myth
Analyzes the timeline and comparison to ancient folklore. Verifies that early creedal traditions (within 1-5 years) predate legendary development, incorporates 'Hostile Scholar' agreements, and uses Ockham's Razor to dismantle the desperate "Conflated" theory.

### 5. Morality & Meaning
Connects the historical event to existential reality. Argues that without God, morality faces the "Grounding Problem," but the Resurrection secures infinite human dignity and worth.

### 6. Evil & Suffering
Tackles the ultimate emotional and logical problem of pain. Moves through the Free Will defense and Soul-Building, concluding with the Cross (God entering the pain) and the Resurrection as the prototype for the definitive "Future Restoration" of all things.

## 🎯 Features

*   **Cascading Serial Chains**: Every hub functions as an intuitive Socratic dialogue, guiding users step-by-step through historical claims and skeptical counter-claims.
*   **Systemic Vetoes**: "Cross-Hub" links demonstrate how physical evidence in one area (e.g., the Empty Tomb) scientifically vetoes theories in another (e.g., Hallucinations).
*   **Guided Tours**: Four automated, narrative pathways built into the system that highlight specific logical journeys:
    1.  *The Historical Bedrock*
    2.  *Radical Transformation*
    3.  *The Skeptical Stress Test*
    4.  *The Grand Finale (Cumulative Synthesis)*
*   **Cumulative Case Climax**: All overarching paths inevitably converge onto a final "Beyond Reasonable Doubt" synthesis.
*   **Immersive UI**: Features responsive panning, dynamic collision-free node spacing, and sliding detail drawers.

## 🚀 Tech Stack

*   **Framework:** Vite + React
*   **Interactive Canvas:** `@xyflow/react` (React Flow)
*   **Styling Theme:** Tailwind CSS v4 (configured for immersive Dark Mode)
*   **Animations:** `framer-motion` (for the responsive Right-Side sliding Drawer)
*   **Icons:** `lucide-react`
*   **Data Structure:** Powered directly by a strict, cascading `apologetics.json` state array.

## 🛠️ Getting Started

To view this canvas locally on your machine:

1.  **Install dependencies:**
    ```bash
    npm install
    ```
2.  **Start the development server:**
    ```bash
    npm run dev
    ```
3.  **Open your browser** to the localhost port provided in the terminal (usually `http://localhost:5173`).

### How to use the App:
*   **Click + Drag** anywhere on the background to pan the canvas.
*   **Scroll** up and down to zoom in and out of the map.
*   **Click** on any rectangular Node (Card) to slide out the detailed context Drawer. Hit the `X` or press `Esc` to close it.
