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
  // Which hub is currently expanded (null = overview, string = hub id)
  const [expandedHubId, setExpandedHubId] = useState(null);
  const [selectedNodeData, setSelectedNodeData] = useState(null);
  const [rfInstance, setRfInstance] = useState(null);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [showPresenterNotes, setShowPresenterNotes] = useState(false);
  
  // Tours State
  const [activeTour, setActiveTour] = useState(null);
  const [tourStepIndex, setTourStepIndex] = useState(0);
  const [isToursMenuOpen, setIsToursMenuOpen] = useState(false);

  // The hub IDs
  const hubIds = ['grp_worldview_cross', 'grp_tomb', 'grp_appearances', 'grp_mythicism', 'grp_morality', 'grp_evil'];

  // Hub positions (hexagonal layout around center)
  const hubPositions = {
    'core_resurrection': { x: 0, y: 0 },
    'grp_morality': { x: 0, y: -450 },
    'grp_worldview_cross': { x: -480, y: -240 },
    'grp_tomb': { x: 480, y: -240 },
    'grp_appearances': { x: -480, y: 240 },
    'grp_mythicism': { x: 480, y: 240 },
    'grp_evil': { x: 0, y: 450 },
  };

  // Compute visible nodes and edges
  const { viewNodes, viewEdges } = useMemo(() => {
    const visibleIds = new Set(['core_resurrection', ...hubIds]);

    if (expandedHubId) {
      apologeticsData.nodes.forEach(n => {
        if (n.parentId === expandedHubId) visibleIds.add(n.id);
      });
      if (expandedHubId === 'grp_mythicism') {
        visibleIds.add('obj_conflated');
        visibleIds.add('ref_conflated');
      }
    }

    // Determine active edges first so we can use them for layout
    const activeEdges = apologeticsData.edges
      .filter(e => visibleIds.has(e.source) && visibleIds.has(e.target))
      .map(e => ({
        ...e,
        type: 'causal',
        animated: false,
        data: { ...e.data, active: true }
      }));

    // Calculate layout tree from expanded hub using BFS
    const nodeLayout = {};
    if (expandedHubId) {
      const parentPos = hubPositions[expandedHubId];
      const baseAngle = Math.atan2(parentPos.y, parentPos.x);

      const adj = {};
      activeEdges.forEach(e => {
        if (!adj[e.source]) adj[e.source] = [];
        adj[e.source].push(e.target);
      });

      const nodeDepth = { [expandedHubId]: 0 };
      const treeChildren = {};
      const queue = [expandedHubId];

      while (queue.length > 0) {
        const curr = queue.shift();
        if (adj[curr]) {
          adj[curr].forEach(next => {
            if (nodeDepth[next] === undefined) {
              nodeDepth[next] = nodeDepth[curr] + 1;
              if (!treeChildren[curr]) treeChildren[curr] = [];
              treeChildren[curr].push(next);
              queue.push(next);
            }
          });
        }
      }

      // Recursively assign pie-slice angles to children
      const spread = Math.PI * 0.85; // Max fan distance
      const assignAngles = (nodeId, angleStart, angleEnd) => {
        nodeLayout[nodeId] = {
          depth: nodeDepth[nodeId],
          angle: (angleStart + angleEnd) / 2
        };
        const children = treeChildren[nodeId] || [];
        if (children.length > 0) {
          const step = (angleEnd - angleStart) / children.length;
          children.forEach((childId, i) => {
            assignAngles(childId, angleStart + (i * step), angleStart + ((i + 1) * step));
          });
        }
      };

      assignAngles(expandedHubId, baseAngle - spread / 2, baseAngle + spread / 2);

      // Fallback for unconnected items
      apologeticsData.nodes.forEach(n => {
        if (visibleIds.has(n.id) && !hubPositions[n.id] && !nodeLayout[n.id]) {
          nodeLayout[n.id] = { depth: 1, angle: baseAngle };
        }
      });
    }

    const activeNodes = apologeticsData.nodes
      .filter(n => visibleIds.has(n.id))
      .map(n => {
        let pos;

        if (hubPositions[n.id]) {
          pos = hubPositions[n.id];
        } else if (expandedHubId && nodeLayout[n.id]) {
          const parentPos = hubPositions[expandedHubId];
          const layout = nodeLayout[n.id];
          
          // Outer radius expansion by depth
          const depthRadius = 260; 
          const radius = 260 + Math.max(0, layout.depth - 1) * depthRadius;

          pos = {
            x: parentPos.x + Math.cos(layout.angle) * radius,
            y: parentPos.y + Math.sin(layout.angle) * radius,
          };

          // Hardcoded layout logic offset for custom orphan nodes
          if (n.id === 'obj_conflated') { pos.x += 100; pos.y += 150; }
          if (n.id === 'ref_conflated') { pos.x += 100; pos.y += 300; }
        } else {
          pos = { x: 0, y: 0 };
        }

        return {
          ...n,
          position: pos,
          parentId: undefined,
          type: 'custom',
          data: { ...n.data, dimmed: false }
        };
      });

    return { viewNodes: activeNodes, viewEdges: activeEdges };
  }, [expandedHubId]);

  const [nodes, setNodes] = useState(viewNodes);
  const [edges, setEdges] = useState(viewEdges);

  // Sync view state to React Flow
  React.useEffect(() => {
    setNodes(viewNodes);
    setEdges(viewEdges);
    if (rfInstance && !activeTour) {
      if (expandedHubId) {
        // Zoom to fit just the hub + its children
        const clusterIds = [expandedHubId, 'core_resurrection'];
        apologeticsData.nodes.forEach(n => {
          if (n.parentId === expandedHubId) clusterIds.push(n.id);
        });
        setTimeout(() => rfInstance.fitView({ 
          nodes: clusterIds.map(id => ({ id })), 
          padding: 0.3, 
          duration: 600 
        }), 50);
      } else {
        setTimeout(() => rfInstance.fitView({ padding: 0.4, duration: 600 }), 50);
      }
    }
  }, [viewNodes, viewEdges, rfInstance, activeTour, expandedHubId]);

  // Tour auto-focus
  React.useEffect(() => {
    if (activeTour && rfInstance) {
      setTimeout(() => {
        const currentStepId = activeTour.steps[tourStepIndex];
        const targetNode = apologeticsData.nodes.find(n => n.id === currentStepId);
        
        if (targetNode) {
          const requiredHub = targetNode.parentId || null;
          if (expandedHubId !== requiredHub) {
            setExpandedHubId(requiredHub);
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

  // Click handler — the heart of the concentric ring interaction
  const hubIds_set = new Set(['grp_worldview_cross', 'grp_tomb', 'grp_appearances', 'grp_mythicism', 'grp_morality', 'grp_evil']);
  
  const onNodeClick = React.useCallback((event, node) => {
    if (node.id === 'core_resurrection') {
      // Click core → collapse to overview
      setExpandedHubId(null);
      setSelectedNodeData(null);
    } else if (hubIds_set.has(node.id)) {
      // Click hub → expand/collapse its children
      setExpandedHubId(prev => prev === node.id ? null : node.id);
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
              setExpandedHubId(null);
              setSelectedNodeData(null);
              setActiveTour(null);
            }}
            className={`flex items-center gap-2 font-medium transition-colors ${!expandedHubId ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <Home className="w-4 h-4" />
            Overview
          </button>
          
          {expandedHubId && (
            <>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
              <span className="font-semibold text-foreground">
                {apologeticsData.nodes.find(n => n.id === expandedHubId)?.data.label}
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
