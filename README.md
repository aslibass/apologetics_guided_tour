# Christian Apologetics: Systems Thinking Web App

A modern, interactive React web application designed to visually map out the logical, historical, and philosophical flow of Christian Apologetics—specifically focusing on the **"Minimal Facts"** approach to the Resurrection of Jesus Christ.

Built with **React Flow**, **Tailwind CSS v4** (Dark Mode), and **Framer Motion**, this educational tool allows users to explore the causal links between historical evidence, skeptical objections, and logical refutations.

---

## 🗺️ Topics Covered (The 24-Node Map)

The application maps out 24 distinct interactive nodes, broken down into 4 philosophical categories:

### 🟡 1. The Core Event
*   **The Resurrection of Christ:** The central axis of the Christian faith. All historical lines of evidence point to this event, and all objections attempt to explain it away.
*   **Religio-Historical Context:** (Added per W.L. Craig) Miracles don't happen in a vacuum. Jesus' radical claims to divinity change the probability calculus.

### 🔵 2. The Historical "Minimal Facts" (Evidence)
These are six foundational historical facts universally agreed upon by the vast majority of critical and secular New Testament historians:
*   **Death by Crucifixion:** Jesus definitively died under Roman execution.
*   **The Empty Tomb:** His tomb was found empty just days later by female followers.
*   **Post-Mortem Appearances:** Individuals and groups experienced literal appearances of a risen Jesus.
*   **Apostolic Transformation:** The terrified disciples suddenly became bold proclaimers willing to die for this specific claim.
*   **Conversion of Skeptics:** Enemies like Paul and skeptics like James were radically converted by post-mortem appearances.
*   **Early Creedal Traditions:** Belief in the resurrection (1 Cor 15) predates the New Testament writings by decades, eliminating the possibility of late-developing myth.
*   **Journalistic/Legal Evidentiary Standard:** (Added per Lee Strobel) Applying modern legal corroboration standards to the eyewitness accounts makes the historical case extraordinarily robust.

### 🔴 3. Skeptical Objections
These are the six most prominent naturalistic theories attempting to explain away the historical data:
*   **Swoon Theory (Apparent Death):** Did Jesus merely pass out on the cross and revive in the tomb?
*   **Conspiracy / Stolen Body:** Did the disciples steal the corpse to fake a resurrection?
*   **Wrong Tomb Theory:** Did the women just get lost and accidentally assume a miracle?
*   **Mass Hallucination Theory:** Were the appearances merely grief-induced, collective hallucinations?
*   **Cognitive Dissonance:** (Added per N.T. Wright) Was belief just a coping mechanism for a failed Messiah?
*   **Mythicism & Legend Theory:** Was the whole story heavily exaggerated over centuries?

### 🟢 4. Logical & Historical Refutations
These nodes demonstrate the historical, medical, or psychological impossibility of each skeptical objection, alongside broader worldview defenses:
*   **Medical Impossibility of Survival:** Roman crucifixion was infallibly fatal; the JAMA medical study confirms this. *(Refutes Swoon)*
*   **Liars Make Poor Martyrs:** People don't willingly suffer torture and death for a lie they knowingly invented. *(Refutes Stolen Body)*
*   **Authorities Knew the Location:** The Romans or Jewish leaders would have just produced the body to crush the movement. *(Refutes Wrong Tomb)*
*   **Psycho-Medical Impossibility:** Group hallucinations do not exist, and hallucinations do not leave an empty tomb behind. *(Refutes Hallucination)*
*   **Dissonance Changes Theology, Not Reality:** Coping mechanisms lead to spiritualizing a belief, not inventing a tangible, bodily resurrection. *(Refutes Dissonance)*
*   **Historically Too Early for Legend:** The early creeds date to within 1-5 years of the cross, too early for myth to displace eyewitness memory. *(Refutes Legend)*
*   **Science & The Rational Universe:** (John Lennox) True atheistic naturalism cannot justify why we trust our minds to do science; Christian Theism grounds rationality.
*   **The Moral Architecture of Reality:** (Ravi Zacharias) Without God, one cannot logically defend objective moral values or human dignity.
*   **Anthropic Principle / Fine-Tuning:** (Lee Strobel) The physical constants of the universe are balanced on a razor's edge from the Big Bang, strongly implying a Divine Architect.

---

## 🚀 Tech Stack
*   **Framework:** Vite + React
*   **Interactive Canvas:** `@xyflow/react` (React Flow)
*   **Styling Theme:** Tailwind CSS v4 (configured for immersive Dark Mode)
*   **Animations:** `framer-motion` (for the responsive Right-Side sliding Drawer)
*   **Icons:** `lucide-react`
*   **Data Structure:** Powered directly by a clean, static `apologetics.json` state array.

---

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
