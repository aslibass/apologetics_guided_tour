import React, { useState, useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
  MiniMap
} from '@xyflow/react';

import { CustomNode } from './components/CustomNode';
import { Drawer } from './components/Drawer';
import apologeticsData from './data/apologetics.json';

// Define our node types
const nodeTypes = {
  custom: CustomNode,
};

export default function App() {
  // Set up React Flow initial state from the bundled JSON layout
  const initialNodes = useMemo(() => 
    apologeticsData.nodes.map(node => ({
      ...node,
      type: 'custom', 
    })), 
  []);

  const initialEdges = useMemo(() => apologeticsData.edges, []);

  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);
  const [selectedNodeData, setSelectedNodeData] = useState(null);
  const [focusedNodeId, setFocusedNodeId] = useState(null);
  
  // Presentation State
  const [rfInstance, setRfInstance] = useState(null);
  const [currentTour, setCurrentTour] = useState(null);
  const [tourIndex, setTourIndex] = useState(0);
  const [visibleCategories, setVisibleCategories] = useState(['core', 'evidence', 'objection', 'refutation']);

  // Handle standard node dragging/selection
  const onNodesChange = useCallback((changes) => {
    // We disable onNodesChange if we strictly manage layout, but it's ok to allow dragging
    setNodes((nds) => applyNodeChanges(changes, nds));
  }, []);
  
  const onEdgesChange = useCallback((changes) => {
    setEdges((eds) => applyEdgeChanges(changes, eds));
  }, []);

  // Compute Active Views based on Focus and Layers
  React.useEffect(() => {
    // Filter layers
    let computedNodes = initialNodes.filter(n => visibleCategories.includes(n.data.category));
    const validNodeIds = new Set(computedNodes.map(n => n.id));
    let computedEdges = initialEdges.filter(e => validNodeIds.has(e.source) && validNodeIds.has(e.target));

    // Apply Dimming if Focused
    if (focusedNodeId) {
      const connectedNodeIds = new Set([focusedNodeId]);
      computedEdges.forEach(e => {
        if (e.source === focusedNodeId || e.target === focusedNodeId) {
          connectedNodeIds.add(e.source);
          connectedNodeIds.add(e.target);
        }
      });
      
      computedNodes = computedNodes.map(n => ({
        ...n,
        data: { ...n.data, dimmed: !connectedNodeIds.has(n.id) }
      }));
      
      computedEdges = computedEdges.map(e => {
        const isConnected = e.source === focusedNodeId || e.target === focusedNodeId;
        return {
          ...e,
          style: { ...e.style, opacity: isConnected ? 1 : 0.1 }
        };
      });
    } else {
      computedNodes = computedNodes.map(n => ({...n, data: {...n.data, dimmed: false}}));
      computedEdges = computedEdges.map(e => ({...e, style: {...e.style, opacity: 1}}));
    }

    setNodes(computedNodes);
    setEdges(computedEdges);
  }, [visibleCategories, focusedNodeId, initialNodes, initialEdges]);

  // Tour Logic
  const handleNextTourStep = useCallback(() => {
    if (!currentTour) return;
    const tourNodes = apologeticsData.tours[currentTour];
    if (tourIndex < tourNodes.length - 1) {
      const nextIndex = tourIndex + 1;
      setTourIndex(nextIndex);
      const nextNodeId = tourNodes[nextIndex];
      const nextNode = initialNodes.find(n => n.id === nextNodeId);
      
      setFocusedNodeId(nextNodeId);
      setSelectedNodeData(nextNode.data);
      
      if (rfInstance) {
        rfInstance.fitView({ nodes: [{ id: nextNodeId }], duration: 800, padding: 0.5, maxZoom: 1 });
      }
    } else {
      // End Tour
      setCurrentTour(null);
      setFocusedNodeId(null);
      setSelectedNodeData(null);
      if (rfInstance) rfInstance.fitView({ duration: 800 });
    }
  }, [currentTour, tourIndex, rfInstance, initialNodes]);

  // Keyboard Shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't intercept if they are typing in an input (though there are none currently)
      if (e.code === 'Space') {
         e.preventDefault();
         if (currentTour) handleNextTourStep();
      }
      if (e.key === 'Escape') {
         setFocusedNodeId(null);
         setSelectedNodeData(null);
         setCurrentTour(null);
         if (rfInstance) rfInstance.fitView({ duration: 800 });
      }
      if (e.key === '1') {
         setVisibleCategories(['core', 'evidence']);
         if (rfInstance) setTimeout(() => rfInstance.fitView({ duration: 800 }), 50);
      }
      if (e.key === '2') {
         setVisibleCategories(['core', 'evidence', 'objection']);
         if (rfInstance) setTimeout(() => rfInstance.fitView({ duration: 800 }), 50);
      }
      if (e.key === '3') {
         setVisibleCategories(['core', 'evidence', 'objection', 'refutation']);
         if (rfInstance) setTimeout(() => rfInstance.fitView({ duration: 800 }), 50);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentTour, handleNextTourStep, rfInstance]);

  // Interactions
  const onNodeClick = useCallback((event, node) => {
    setSelectedNodeData(node.data);
    setFocusedNodeId(node.id);
  }, []);

  const onPaneClick = useCallback(() => {
    setFocusedNodeId(null);
    setSelectedNodeData(null);
  }, []);

  const handleCloseDrawer = () => {
    // Keep focus, just close drawer? Or clear focus. 
    // The user suggested Esc closes drawer and zooms out, we should do both.
    // If they click 'X' on drawer, maybe just close drawer but keep focus.
    setSelectedNodeData(null);
  };

  return (
    <div className="w-screen h-screen bg-background text-foreground flex flex-col overflow-hidden">
      {/* Sleek Top Header */}
      <header className="fixed top-0 inset-x-0 z-10 p-6 pointer-events-none flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted-foreground drop-shadow-sm">
            The Systems Thinking Guided Tour
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            To Christian Apologetics
          </p>
        </div>
        
        {/* Keyboard Legend */}
        <div className="bg-card/80 backdrop-blur border border-border px-4 py-2 rounded-lg shadow-sm flex gap-4 text-xs font-medium text-muted-foreground">
          <span><kbd className="bg-muted px-1.5 py-0.5 rounded border border-border">1-3</kbd> Toggle Layers</span>
          <span><kbd className="bg-muted px-1.5 py-0.5 rounded border border-border">Esc</kbd> Reset View</span>
          <span><kbd className="bg-muted px-1.5 py-0.5 rounded border border-border">Space</kbd> Next Slide</span>
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
          fitViewOptions={{ padding: 0.2 }}
          proOptions={{ hideAttribution: true }}
          className="bg-background/50"
          defaultEdgeOptions={{
             type: 'smoothstep',
             animated: true,
             style: { strokeWidth: 2 }
          }}
        >
          <Background color="var(--border)" gap={24} size={2} className="opacity-20" />
          <Controls 
            className="!bg-card !border-border !rounded-lg !shadow-xl overflow-hidden fill-foreground"
            showInteractive={false} 
          />
          <MiniMap 
            position="bottom-right" 
            nodeColor={(n) => {
              switch(n.data?.category) {
                case 'core': return '#f59e0b';
                case 'evidence': return '#3b82f6';
                case 'objection': return '#ef4444';
                case 'refutation': return '#10b981';
                default: return '#eee';
              }
            }}
            maskColor="rgba(0, 0, 0, 0.7)"
            style={{ backgroundColor: '#1f2937', borderRadius: '0.5rem', overflow: 'hidden', border: '1px solid #374151' }}
          />
        </ReactFlow>

        {/* Guided Tour Menu */}
        <div className="absolute bottom-6 left-6 z-10 bg-card border rounded-lg shadow-xl p-4 flex flex-col gap-2 w-64">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">Presentation Tours</h3>
          {Object.keys(apologeticsData.tours).map(tourKey => (
            <button 
              key={tourKey}
              className={`text-left text-sm px-3 py-2 rounded-md transition-colors ${currentTour === tourKey ? 'bg-primary text-primary-foreground font-semibold' : 'hover:bg-muted text-muted-foreground'}`}
              onClick={() => {
                setCurrentTour(tourKey);
                setTourIndex(0);
                const firstNodeId = apologeticsData.tours[tourKey][0];
                setFocusedNodeId(firstNodeId);
                const firstNode = initialNodes.find(n => n.id === firstNodeId);
                setSelectedNodeData(firstNode.data);
                if (rfInstance) {
                  rfInstance.fitView({ nodes: [{ id: firstNodeId }], duration: 800, padding: 0.5, maxZoom: 1 });
                }
              }}
            >
              {tourKey.replace(/_/g, ' ').toUpperCase()}
            </button>
          ))}
          
          {currentTour && (
            <button 
              onClick={handleNextTourStep}
              className="mt-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2 px-3 justify-center text-sm rounded shadow flex items-center gap-2 transition-colors"
            >
              Next Slide <kbd className="bg-emerald-700/50 rounded px-1 min-w-[32px]">␣</kbd>
            </button>
          )}
        </div>
      </div>

      {/* Sliding Drawer for Node Data */}
      <Drawer 
        isOpen={selectedNodeData !== null} 
        onClose={handleCloseDrawer} 
        data={selectedNodeData} 
      />
    </div>
  );
}
