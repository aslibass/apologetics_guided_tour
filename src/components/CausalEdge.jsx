import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  useInternalNode,
} from '@xyflow/react';

export function CausalEdge({
  id,
  source,
  target,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
  label,
}) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const isOpposite = data?.causalType === 'opposite';
  const isCausal = !!data?.causalType;
  const strokeColor = isCausal 
    ? (isOpposite ? '#ef4444' : '#10b981')
    : 'rgba(148, 163, 184, 0.6)'; // Neutral slate for non-causal edges
  const dashArray = isOpposite ? '5,5' : '0';
  const isActive = data?.active;
  const opacity = isActive ? 0.85 : 0.05;

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          stroke: strokeColor,
          strokeWidth: isActive ? 3 : 1,
          strokeDasharray: dashArray,
          opacity: opacity,
          transition: 'all 0.3s ease',
        }}
      />
      {label && isActive && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
              zIndex: 10,
            }}
            className="nodrag nopan"
          >
            <div className={`px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold border shadow-sm backdrop-blur-md max-w-[220px] text-center whitespace-normal leading-tight ${
              isCausal
                ? (isOpposite 
                    ? 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400' 
                    : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400')
                : 'bg-slate-500/10 border-slate-500/20 text-slate-400'
            }`}>
              {label}
            </div>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
