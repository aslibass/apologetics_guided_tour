import React, { useState, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
} from '@xyflow/react';
import { Home, ChevronRight, Info, Map, Play, ArrowRight, ArrowLeft, XCircle, Eye, EyeOff } from 'lucide-react';

import { CustomNode } from './components/CustomNode';
import { Drawer } from './components/Drawer';
import { AboutModal } from './components/AboutModal';
import apologeticsData from './data/apologetics.json';

const nodeTypes = {
  custom: CustomNode,
};

export default function App() {
  // Navigation State
  // 'macro' | 'grp_worldview' | 'grp_history' | 'grp_objections' | 'grp_refutations'
  const [currentView, setCurrentView] = useState('macro');
  const [selectedNodeData, setSelectedNodeData] = useState(null);
  const [rfInstance, setRfInstance] = useState(null);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [showPresenterNotes, setShowPresenterNotes] = useState(false);
  
  // Tours State
  const [activeTour, setActiveTour] = useState(null);
  const [tourStepIndex, setTourStepIndex] = useState(0);
  const [isToursMenuOpen, setIsToursMenuOpen] = useState(false);

  // Compute Active Nodes and Edges based on current view
  const { viewNodes, viewEdges } = useMemo(() => {
    let activeNodes = [];
    let activeEdges = [];

    if (currentView === 'macro') {
      // 1. Get Macro Nodes (The 4 Subsystems + The Core Resurrection)
      activeNodes = apologeticsData.nodes.filter(n => n.data.isMacro || n.id === 'core_resurrection');
      // 2. Get Macro Edges
      activeEdges = apologeticsData.macroEdges;
    } else {
      // 1. Get Micro Nodes for the specific subsystem
      activeNodes = apologeticsData.nodes.filter(n => n.parentId === currentView);
      const activeNodeIds = new Set(activeNodes.map(n => n.id));
      
      // 2. Get Micro Edges that connect these specific active nodes
      activeEdges = apologeticsData.edges.filter(e => activeNodeIds.has(e.source) && activeNodeIds.has(e.target));
    }

    // Format them for React Flow
    const formattedNodes = activeNodes.map(n => ({
      ...n,
      type: 'custom', // All nodes are now uniformly styled custom cards
      // Remove parentId so React Flow treats them as independent top-level nodes on this canvas
      parentId: undefined, 
    }));

    return { viewNodes: formattedNodes, viewEdges: activeEdges };
  }, [currentView]);

  const [nodes, setNodes] = useState(viewNodes);
  const [edges, setEdges] = useState(viewEdges);

  // Whenever the view changes, update the graph state and trigger a zoom
  React.useEffect(() => {
    setNodes(viewNodes);
    setEdges(viewEdges);
    // Only auto-fit view if we are NOT in an active tour (tours handle their own zooming)
    if (rfInstance && !activeTour) {
      setTimeout(() => rfInstance.fitView({ padding: 0.3, duration: 800 }), 50);
    }
  }, [viewNodes, viewEdges, rfInstance, activeTour]);

  // Handle Tour Navigation Auto-Focus
  React.useEffect(() => {
    if (activeTour && rfInstance) {
      // Small pause to allow view to settle before animating
      setTimeout(() => {
        const currentStepId = activeTour.steps[tourStepIndex];
        const targetNode = apologeticsData.nodes.find(n => n.id === currentStepId);
        
        if (targetNode) {
          // 1. Determine correct view (macro or specific subsystem)
          const requiredView = targetNode.parentId || 'macro';
          
          // 2. Set view if not already there
          if (currentView !== requiredView) {
            setCurrentView(requiredView);
            // Wait for next render cycle for the actual node to appear in the DOM
             setTimeout(() => {
                focusNode(currentStepId, targetNode);
             }, 300);
          } else {
             focusNode(currentStepId, targetNode);
          }
        }
      }, 100);
    }
  }, [activeTour, tourStepIndex, rfInstance]); // Don't include currentView in dep array to prevent infinite loops

  const focusNode = (nodeId, targetNode) => {
    setSelectedNodeData(targetNode.data); // Open side drawer

    // Find the node in the current React Flow instance to get its rendered position
    const rfNode = rfInstance.getNode(nodeId);
    if (rfNode) {
      // Add dynamic width/height defaults based on if it's macro or micro
      const nWidth = rfNode.measured?.width || 250;
      const nHeight = rfNode.measured?.height || 150;
      
      // Offset the X center to the right (+250) so the node appears further left on the screen,
      // preventing the right-side Drawer from covering it up.
      rfInstance.setCenter(
        rfNode.position.x + (nWidth / 2) + 250, 
        rfNode.position.y + (nHeight / 2), 
        { zoom: 0.85, duration: 800 }
      );
    }
  };

  const onNodesChange = React.useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );
  
  const onEdgesChange = React.useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  // Interactions
  const onNodeClick = React.useCallback((event, node) => {
    setSelectedNodeData(node.data);

    // If a user clicks a Macro Node, Drill-Down into that subsystem!
    if (node.data.isMacro) {
      setCurrentView(node.id);
      setSelectedNodeData(null); // Close drawer during transition
    }
  }, []);

  const onPaneClick = React.useCallback(() => {
    setSelectedNodeData(null);
  }, []);

  return (
    <div className="w-screen h-screen bg-background text-foreground flex flex-col overflow-hidden">
      {/* Dynamic Breadcrumb Header */}
      <header className="fixed top-0 inset-x-0 z-10 p-6 flex justify-between items-center pointer-events-none">
        
        {/* Left Side: Brand & Breadcrumbs */}
        <div className="flex items-center gap-4">
          
          {/* Main Title */}
          <div className="pointer-events-auto bg-card/90 backdrop-blur border border-border px-5 py-2 rounded-lg shadow-sm">
            <h1 className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-primary via-amber-500 to-orange-600 bg-clip-text text-transparent leading-none">
              Resurrection: The Evidence Map
            </h1>
          </div>

          <div className="pointer-events-auto flex items-center gap-2 bg-card/80 backdrop-blur border border-border px-4 py-2 rounded-lg shadow-sm hidden md:flex">
          <button 
            onClick={() => {
              setCurrentView('macro');
              setSelectedNodeData(null);
              setActiveTour(null); // Cancel tour on manual macro return
            }}
            className={`flex items-center gap-2 font-medium transition-colors ${currentView === 'macro' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <Home className="w-4 h-4" />
            Macro System
          </button>
          
          {currentView !== 'macro' && (
            <>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
              <span className="font-semibold text-foreground">
                {apologeticsData.nodes.find(n => n.id === currentView)?.data.label.replace('Subsystem: ', '')}
              </span>
            </>
          )}
        </div>
        </div>

        {/* Right Side Controls */}
        <div className="flex items-center gap-3">

          {/* Presenter Notes Toggle */}
          <button
            onClick={() => setShowPresenterNotes(!showPresenterNotes)}
            className={`pointer-events-auto flex items-center gap-2 px-4 py-2.5 rounded-full shadow-lg transition-all font-semibold active:scale-95 border ${
              showPresenterNotes 
                ? 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20' 
                : 'bg-card/90 backdrop-blur-md border-border/50 text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            {showPresenterNotes ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            <span className="hidden sm:inline">Presenter Mode</span>
          </button>
          
          {/* Guided Tours Dropdown */}
          <div className="relative pointer-events-auto">
            <button
              onClick={() => setIsToursMenuOpen(!isToursMenuOpen)}
              className="flex items-center gap-2 bg-primary/10 border border-primary/20 px-5 py-2.5 rounded-full shadow-lg text-primary hover:bg-primary/20 transition-all font-semibold active:scale-95"
            >
              <Map className="w-5 h-5" />
              Guided Tours
            </button>
            
            {isToursMenuOpen && (
              <div className="absolute right-0 mt-3 w-80 bg-card border border-border shadow-2xl rounded-xl p-2 z-50 animate-in fade-in slide-in-from-top-4">
                <div className="flex justify-between items-center px-3 py-2">
                   <h3 className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Select a Narrative Tour</h3>
                   <button onClick={() => setIsToursMenuOpen(false)} className="text-muted-foreground hover:text-foreground"><XCircle className="w-4 h-4"/></button>
                </div>
                {apologeticsData.tours.map(tour => (
                  <button
                    key={tour.tourId}
                    onClick={() => {
                      setActiveTour(tour);
                      setTourStepIndex(0);
                      setIsToursMenuOpen(false);
                      setSelectedNodeData(null); // Reset drawer
                    }}
                    className="w-full text-left p-3 hover:bg-muted rounded-lg transition-colors group mt-1"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-foreground group-hover:text-primary transition-colors">{tour.title}</span>
                      <Play className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <p className="text-xs text-muted-foreground leading-snug">{tour.description}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Global Info Button */}
          <button
            onClick={() => setIsAboutOpen(true)}
            className="pointer-events-auto flex items-center gap-2 bg-card/90 backdrop-blur-md border border-border/50 px-5 py-2.5 rounded-full shadow-lg text-foreground hover:bg-muted transition-all font-medium hover:scale-105 active:scale-95 shadow-primary/5"
          >
            <Info className="w-5 h-5 text-primary" />
            About
          </button>
        </div>
      </header>

      {/* Main Interactive Canvas */}
      <div className="flex-1 w-full h-full relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          onInit={setRfInstance}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.3 }}
          proOptions={{ hideAttribution: true }}
          className="bg-background/50"
          defaultEdgeOptions={{
             type: 'smoothstep',
             animated: true,
             style: { strokeWidth: 2 },
             labelBgStyle: { fill: '#1f2937', color: '#fff', fillOpacity: 0.9 },
             labelBgPadding: [8, 4],
             labelBgBorderRadius: 12,
             labelStyle: { fill: '#f3f4f6', fontWeight: 600, fontSize: 12 }
          }}
        >
          <Background color="var(--border)" gap={24} size={2} className="opacity-20" />
        </ReactFlow>
      </div>

      {/* Sliding Drawer for Node Data */}
      <Drawer 
        isOpen={!!selectedNodeData} 
        onClose={() => setSelectedNodeData(null)} 
        data={selectedNodeData} 
        showPresenterNotes={showPresenterNotes}
      />

      {/* Floating Tour Controller */}
      {activeTour && (
        <div className="fixed bottom-8 inset-x-0 mx-auto w-max z-20 pointer-events-auto animate-in slide-in-from-bottom-10 fade-in duration-300">
          <div className="bg-card/95 backdrop-blur-xl border border-border p-3 sm:p-4 rounded-2xl shadow-2xl flex items-center gap-4 sm:gap-6">
            
            <div className="flex flex-col min-w-[150px]">
              <span className="text-[10px] uppercase font-bold text-primary tracking-wider mb-0.5">Active Tour</span>
              <span className="text-sm font-semibold text-foreground truncate max-w-[200px]">{activeTour.title}</span>
              <span className="text-xs text-muted-foreground mt-0.5">Step {tourStepIndex + 1} of {activeTour.steps.length}</span>
            </div>

            <div className="w-px h-12 bg-border"></div>

            <div className="flex items-center gap-2 sm:gap-4">
              <button 
                onClick={() => setTourStepIndex(Math.max(0, tourStepIndex - 1))}
                disabled={tourStepIndex === 0}
                className="p-2 sm:p-3 rounded-full hover:bg-muted text-foreground disabled:opacity-30 transition-all font-medium flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline text-sm">Prev</span>
              </button>
              
              <button 
                onClick={() => setTourStepIndex(Math.min(activeTour.steps.length - 1, tourStepIndex + 1))}
                disabled={tourStepIndex === activeTour.steps.length - 1}
                className="p-2 sm:p-3 px-3 sm:px-5 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-30 transition-all shadow-lg shadow-primary/20 font-medium flex items-center gap-2 hover:scale-105 active:scale-95"
              >
                <span className="text-sm">Next</span>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            <div className="w-px h-12 bg-border"></div>

            <button 
              onClick={() => {
                setActiveTour(null);
                setSelectedNodeData(null);
              }}
              className="flex items-center gap-2 px-3 py-2 sm:px-4 text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors text-xs sm:text-sm font-medium"
            >
              <XCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Exit Tour</span>
            </button>

          </div>
        </div>
      )}

      {/* Instructional Modal */}
      <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
    </div>
  );
}
