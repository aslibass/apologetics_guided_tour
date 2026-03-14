import React, { useState, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
} from '@xyflow/react';
import { Home, ChevronRight, Info } from 'lucide-react';

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
    if (rfInstance) {
      setTimeout(() => rfInstance.fitView({ padding: 0.2, duration: 800 }), 50);
    }
  }, [viewNodes, viewEdges, rfInstance]);

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
        <div className="pointer-events-auto flex items-center gap-2 bg-card/80 backdrop-blur border border-border px-4 py-2 rounded-lg shadow-sm">
          <button 
            onClick={() => {
              setCurrentView('macro');
              setSelectedNodeData(null);
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

        {/* Global Info Button */}
        <button
          onClick={() => setIsAboutOpen(true)}
          className="pointer-events-auto flex items-center gap-2 bg-card/90 backdrop-blur-md border border-border/50 px-5 py-2.5 rounded-full shadow-lg text-foreground hover:bg-muted transition-all font-medium hover:scale-105 active:scale-95 shadow-primary/5"
        >
          <Info className="w-5 h-5 text-primary" />
          About & Sources
        </button>
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
      />

      {/* Instructional Modal */}
      <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
    </div>
  );
}
