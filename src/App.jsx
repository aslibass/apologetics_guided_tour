import React, { useState, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
} from '@xyflow/react';
import { Home, ChevronRight, Info, Map, Play, ArrowRight, ArrowLeft, XCircle, Eye, EyeOff } from 'lucide-react';

import { CustomNode } from './components/CustomNode';
import { CausalEdge } from './components/CausalEdge';
import { Drawer } from './components/Drawer';
import { AboutModal } from './components/AboutModal';
import apologeticsData from './data/apologetics.json';

const nodeTypes = {
  custom: CustomNode,
};

const edgeTypes = {
  causal: CausalEdge,
};

export default function App() {
  // Which hubs are currently expanded
  const [expandedHubs, setExpandedHubs] = useState(new Set());
  const [selectedNodeData, setSelectedNodeData] = useState(null);
  const [rfInstance, setRfInstance] = useState(null);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [showPresenterNotes, setShowPresenterNotes] = useState(false);
  
  // Tours State
  const [activeTour, setActiveTour] = useState(null);
  const [tourStepIndex, setTourStepIndex] = useState(0);
  const [isToursMenuOpen, setIsToursMenuOpen] = useState(false);

  // The hub IDs in preferred vertical rendering order
  const hubIds = ['grp_worldview_cross', 'grp_tomb', 'grp_appearances', 'grp_mythicism', 'grp_morality', 'grp_evil'];
  const hubIds_set = new Set(hubIds);

  // Compute visible nodes and edges
  const { viewNodes, viewEdges } = useMemo(() => {
    const visibleIds = new Set(['core_resurrection', ...hubIds]);

    const activeEdges = apologeticsData.edges
      .map(e => ({
        ...e,
        type: 'causal',
        animated: false,
        data: { ...e.data, active: false }
      }));

    const nodeLayout = {};
    const Y_SPACING = 300;
    const X_SPACING = 550;
    
    // 0. Build quick map of Node ID -> Parent Hub ID to enforce swimlane bounds
    const nodeParentMap = {};
    apologeticsData.nodes.forEach(n => {
       nodeParentMap[n.id] = n.parentId || null;
    });

    // 1. Calculate the Core and Hub Positions
    nodeLayout['core_resurrection'] = { x: 0, y: 0 };
    nodeLayout['core_cumulative_case'] = { x: 3000, y: 0 }; // Permanently anchor the Grand Finale
    
    hubIds.forEach((id, index) => {
      // Stack vertically and center them around y=0
      const yPos = (index - 2.5) * Y_SPACING;
      nodeLayout[id] = { x: X_SPACING, y: yPos, hubId: id, depth: 0 };
    });

    // 2. Expand activated hubs using Constrained BFS
    if (expandedHubs.size > 0) {
      // Build adjacency list for fast children lookup
      const adj = {};
      apologeticsData.edges.forEach(e => {
        if (!adj[e.source]) adj[e.source] = [];
        adj[e.source].push(e.target);
      });

      expandedHubs.forEach(hubId => {
        if (!hubIds_set.has(hubId)) return;
        
        const queue = [{ id: hubId, depth: 0 }];
        const visited = new Set([hubId]);
        
        while (queue.length > 0) {
          const { id: currId, depth } = queue.shift();
          
          if (currId !== hubId) {
             visibleIds.add(currId);
             // Assign structural layout to children along the hub's specific Y-swimlane
             const hubY = nodeLayout[hubId].y;
             nodeLayout[currId] = { x: X_SPACING + (depth * X_SPACING), y: hubY, hubId, depth };
          }

          if (adj[currId]) {
            adj[currId].forEach(nextId => {
              // CRITICAL CONSTRAINT: The next node MUST physically belong to this Hub sequence.
              if (!visited.has(nextId) && nodeParentMap[nextId] === hubId) {
                visited.add(nextId);
                queue.push({ id: nextId, depth: depth + 1 });
              }
            });
          }
        }
      });
    }

    // 3. Filter active edges
    const finalEdges = activeEdges.filter(e => visibleIds.has(e.source) && visibleIds.has(e.target));
    finalEdges.forEach(e => { e.data.active = true; });

    // 4. Map final node objects
    const activeNodes = apologeticsData.nodes
      .filter(n => visibleIds.has(n.id))
      .map(n => {
        const layout = nodeLayout[n.id] || { x: 0, y: 0 };
        return {
          ...n,
          position: { x: layout.x, y: layout.y },
          parentId: undefined,
          type: 'custom',
          data: { ...n.data, dimmed: expandedHubs.size > 0 && n.id !== 'core_resurrection' && !n.data.isHub && !expandedHubs.has(layout.hubId) }
        };
      });

    return { viewNodes: activeNodes, viewEdges: finalEdges };
  }, [expandedHubs]);

  const [nodes, setNodes] = useState(viewNodes);
  const [edges, setEdges] = useState(viewEdges);

  // Sync view state to React Flow
  React.useEffect(() => {
    setNodes(viewNodes);
    setEdges(viewEdges);
    if (rfInstance && !activeTour) {
      if (expandedHubs.size > 0) {
        // Fit view to all visible expanded elements
        setTimeout(() => rfInstance.fitView({ padding: 0.3, duration: 800 }), 50);
      } else {
        setTimeout(() => rfInstance.fitView({ padding: 0.4, duration: 600 }), 50);
      }
    }
  }, [viewNodes, viewEdges, rfInstance, activeTour, expandedHubs]);

  // Tour auto-focus
  React.useEffect(() => {
    if (activeTour && rfInstance) {
      setTimeout(() => {
        const currentStepId = activeTour.steps[tourStepIndex];
        const targetNode = apologeticsData.nodes.find(n => n.id === currentStepId);
        
        if (targetNode) {
          const requiredHub = targetNode.parentId || targetNode.id;
          if (requiredHub && !expandedHubs.has(requiredHub) && hubIds_set.has(requiredHub)) {
            // Keep previous hubs open during the tour so systemic veto cross-links remain visible
            setExpandedHubs(prev => new Set([...prev, requiredHub]));
            setTimeout(() => focusNode(currentStepId, targetNode), 400);
          } else {
            focusNode(currentStepId, targetNode);
          }
        }
      }, 100);
    }
  }, [activeTour, tourStepIndex, rfInstance]);

  const focusNode = (nodeId, targetNode) => {
    setSelectedNodeData(targetNode.data);
    const rfNode = rfInstance.getNode(nodeId);
    if (rfNode) {
      const nWidth = rfNode.measured?.width || 250;
      const nHeight = rfNode.measured?.height || 150;
      // In horizontal layout, we need to zoom out slightly more to see the parallel swimlane structure
      rfInstance.setCenter(
        rfNode.position.x + (nWidth / 2) + 200, 
        rfNode.position.y + (nHeight / 2), 
        { zoom: 0.75, duration: 800 }
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

  const onNodeClick = React.useCallback((event, node) => {
    if (node.id === 'core_resurrection') {
      // Click core → collapse everything to overview
      setExpandedHubs(new Set());
      setSelectedNodeData(null);
    } else if (hubIds_set.has(node.id)) {
      // Click hub → toggle its specific swimlane independently
      setExpandedHubs(prev => {
        const next = new Set(prev);
        if (next.has(node.id)) next.delete(node.id);
        else next.add(node.id);
        return next;
      });
      setSelectedNodeData(null);
    } else {
      // Click child → open drawer
      setSelectedNodeData(node.data);
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
              setExpandedHubs(new Set());
              setSelectedNodeData(null);
              setActiveTour(null);
            }}
            className={`flex items-center gap-2 font-medium transition-colors ${expandedHubs.size === 0 ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <Home className="w-4 h-4" />
            Overview
          </button>
          
          {expandedHubs.size > 0 && (
            <>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
              <span className="font-semibold text-foreground">
                {expandedHubs.size} Active {expandedHubs.size === 1 ? 'Chain' : 'Chains'}
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
                      setExpandedHubs(new Set()); // Clear canvas for maximum focus
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
          edgeTypes={edgeTypes}
          fitView
          fitViewOptions={{ padding: 0.4 }}
          proOptions={{ hideAttribution: true }}
          className="bg-background/50"
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
