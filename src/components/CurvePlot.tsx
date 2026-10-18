import React from 'react';
import { GraphSpec } from '../types/math';

interface CurvePlotProps {
  spec: GraphSpec;
  width?: number;
  height?: number;
  className?: string;
  showGrid?: boolean;
}

export const CurvePlot: React.FC<CurvePlotProps> = ({
  spec,
  width = 360,
  height = 280,
  className = '',
  showGrid = true,
}) => {
  const [xMin, xMax] = spec.xRange;
  const [yMin, yMax] = spec.yRange;

  const padding = 34;
  const plotWidth = width - padding * 2;
  const plotHeight = height - padding * 2;

  // Coordinate transformations
  const toSvgX = (x: number) => padding + ((x - xMin) / (xMax - xMin)) * plotWidth;
  const toSvgY = (y: number) => padding + ((yMax - y) / (yMax - yMin)) * plotHeight;

  // Generate integer ticks
  const xStep = Math.max(1, Math.round((xMax - xMin) / 10));
  const yStep = Math.max(1, Math.round((yMax - yMin) / 10));

  const xTicks: number[] = [];
  for (let x = Math.ceil(xMin); x <= Math.floor(xMax); x += xStep) {
    xTicks.push(x);
  }

  const yTicks: number[] = [];
  for (let y = Math.ceil(yMin); y <= Math.floor(yMax); y += yStep) {
    yTicks.push(y);
  }

  // Curve plotting helper
  const evaluateFunction = (fn: GraphSpec['functions'][0], x: number): number | null => {
    const p = fn.params;
    if (fn.type === 'quadratic') {
      const a = p.a ?? 1;
      const b = p.b ?? 0;
      const c = p.c ?? 0;
      return a * x * x + b * x + c;
    }
    if (fn.type === 'reciprocal') {
      const k = p.k ?? 1;
      const c = p.c ?? 0;
      if (Math.abs(x) < 0.05) return null; // Avoid singularity
      return k / x + c;
    }
    if (fn.type === 'cubic') {
      const a = p.a ?? 1;
      const b = p.b ?? 0;
      const c = p.c ?? 0;
      const d = p.d ?? 0;
      return a * x * x * x + b * x * x + c * x + d;
    }
    if (fn.type === 'exponential') {
      const a = p.a ?? 1;
      const b = p.b ?? 2;
      return a * Math.pow(b, x);
    }
    if (fn.type === 'linear') {
      const m = p.m ?? 1;
      const c = p.c ?? 0;
      return m * x + c;
    }
    return null;
  };

  const generatePathD = (fn: GraphSpec['functions'][0]): string => {
    const segments: string[] = [];
    const steps = 180;
    const dx = (xMax - xMin) / steps;
    let currentSegment: [number, number][] = [];

    for (let i = 0; i <= steps; i++) {
      const x = xMin + i * dx;
      const y = evaluateFunction(fn, x);

      if (y === null || isNaN(y) || y < yMin - (yMax - yMin) * 0.5 || y > yMax + (yMax - yMin) * 0.5) {
        if (currentSegment.length > 0) {
          segments.push(formatSegment(currentSegment));
          currentSegment = [];
        }
      } else {
        currentSegment.push([toSvgX(x), toSvgY(y)]);
      }
    }

    if (currentSegment.length > 0) {
      segments.push(formatSegment(currentSegment));
    }

    return segments.join(' ');
  };

  const formatSegment = (points: [number, number][]): string => {
    if (points.length === 0) return '';
    return points.reduce((acc, [sx, sy], index) => {
      return index === 0 ? `M ${sx.toFixed(1)} ${sy.toFixed(1)}` : `${acc} L ${sx.toFixed(1)} ${sy.toFixed(1)}`;
    }, '');
  };

  // Tangent line helper if present
  let tangentLineD = '';
  if (spec.tangentAt) {
    const { x: tx, y: ty, gradient: m, xSpan } = spec.tangentAt;
    const [tMinX, tMaxX] = xSpan || [xMin, xMax];
    const x1 = Math.max(xMin, tMinX);
    const y1 = ty + m * (x1 - tx);
    const x2 = Math.min(xMax, tMaxX);
    const y2 = ty + m * (x2 - tx);
    tangentLineD = `M ${toSvgX(x1).toFixed(1)} ${toSvgY(y1).toFixed(1)} L ${toSvgX(x2).toFixed(1)} ${toSvgY(y2).toFixed(1)}`;
  }

  const originX = toSvgX(0);
  const originY = toSvgY(0);

  return (
    <div className={`inline-block bg-white rounded-lg border border-slate-200 shadow-sm p-2 ${className}`}>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="font-sans select-none overflow-visible"
        aria-label="Mathematical Curve Graph"
      >
        <defs>
          <marker
            id="axis-arrow"
            viewBox="0 0 10 10"
            refX="6"
            refY="5"
            markerWidth="5"
            markerHeight="5"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 9 5 L 0 9 z" fill="#475569" />
          </marker>
        </defs>

        {/* Background grid */}
        {showGrid && (
          <g className="grid-lines" stroke="#e2e8f0" strokeWidth="0.8">
            {xTicks.map((x) => (
              <line
                key={`gx-${x}`}
                x1={toSvgX(x)}
                y1={padding}
                x2={toSvgX(x)}
                y2={height - padding}
              />
            ))}
            {yTicks.map((y) => (
              <line
                key={`gy-${y}`}
                x1={padding}
                y1={toSvgY(y)}
                x2={width - padding}
                y2={toSvgY(y)}
              />
            ))}
          </g>
        )}

        {/* Line of Symmetry if present */}
        {spec.lineOfSymmetry !== undefined && (
          <g>
            <line
              x1={toSvgX(spec.lineOfSymmetry)}
              y1={padding}
              x2={toSvgX(spec.lineOfSymmetry)}
              y2={height - padding}
              stroke="#0ea5e9"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />
            <text
              x={toSvgX(spec.lineOfSymmetry)}
              y={padding - 6}
              textAnchor="middle"
              className="text-[10px] font-mono fill-sky-600 font-semibold"
            >
              x = {spec.lineOfSymmetry}
            </text>
          </g>
        )}

        {/* Asymptotes if present */}
        {spec.asymptotes?.x?.map((ax) => (
          <line
            key={`asymp-x-${ax}`}
            x1={toSvgX(ax)}
            y1={padding}
            x2={toSvgX(ax)}
            y2={height - padding}
            stroke="#ef4444"
            strokeWidth="1.2"
            strokeDasharray="3 3"
          />
        ))}
        {spec.asymptotes?.y?.map((ay) => (
          <line
            key={`asymp-y-${ay}`}
            x1={padding}
            y1={toSvgY(ay)}
            x2={width - padding}
            y2={toSvgY(ay)}
            stroke="#ef4444"
            strokeWidth="1.2"
            strokeDasharray="3 3"
          />
        ))}

        {/* X and Y Axes */}
        <g stroke="#334155" strokeWidth="1.6">
          {/* X-axis */}
          {yMin <= 0 && yMax >= 0 ? (
            <line
              x1={padding - 10}
              y1={originY}
              x2={width - padding + 14}
              y2={originY}
              markerEnd="url(#axis-arrow)"
            />
          ) : (
            <line
              x1={padding}
              y1={height - padding}
              x2={width - padding + 10}
              y2={height - padding}
              markerEnd="url(#axis-arrow)"
            />
          )}

          {/* Y-axis */}
          {xMin <= 0 && xMax >= 0 ? (
            <line
              x1={originX}
              y1={height - padding + 10}
              x2={originX}
              y2={padding - 14}
              markerEnd="url(#axis-arrow)"
            />
          ) : (
            <line
              x1={padding}
              y1={height - padding}
              x2={padding}
              y2={padding - 10}
              markerEnd="url(#axis-arrow)"
            />
          )}
        </g>

        {/* Axis Labels */}
        <text
          x={width - padding + 16}
          y={yMin <= 0 && yMax >= 0 ? originY + 4 : height - padding + 4}
          className="text-[12px] font-serif font-bold italic fill-slate-700"
        >
          x
        </text>
        <text
          x={xMin <= 0 && xMax >= 0 ? originX - 4 : padding - 4}
          y={padding - 16}
          className="text-[12px] font-serif font-bold italic fill-slate-700"
        >
          y
        </text>
        {xMin <= 0 && xMax >= 0 && yMin <= 0 && yMax >= 0 && (
          <text
            x={originX - 10}
            y={originY + 14}
            className="text-[11px] font-serif italic fill-slate-500"
          >
            O
          </text>
        )}

        {/* Tick numbers */}
        <g className="tick-labels" fill="#64748b" fontSize="10">
          {xTicks
            .filter((x) => x !== 0)
            .map((x) => (
              <text
                key={`tx-${x}`}
                x={toSvgX(x)}
                y={yMin <= 0 && yMax >= 0 ? originY + 13 : height - padding + 13}
                textAnchor="middle"
              >
                {x}
              </text>
            ))}
          {yTicks
            .filter((y) => y !== 0)
            .map((y) => (
              <text
                key={`ty-${y}`}
                x={xMin <= 0 && xMax >= 0 ? originX - 6 : padding - 6}
                y={toSvgY(y) + 3}
                textAnchor="end"
              >
                {y}
              </text>
            ))}
        </g>

        {/* Render Curves */}
        {spec.functions.map((fn, idx) => (
          <path
            key={`fn-${idx}`}
            d={generatePathD(fn)}
            fill="none"
            stroke={fn.color || '#1e3a8a'}
            strokeWidth={fn.dashed ? '1.8' : '2.4'}
            strokeDasharray={fn.dashed ? '5 4' : undefined}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}

        {/* Render Tangent line if present */}
        {spec.tangentAt && (
          <g>
            <path
              d={tangentLineD}
              fill="none"
              stroke="#f59e0b"
              strokeWidth="2.2"
              strokeDasharray="6 3"
            />
            {/* Tangent point dot */}
            <circle
              cx={toSvgX(spec.tangentAt.x)}
              cy={toSvgY(spec.tangentAt.y)}
              r="4.5"
              fill="#d97706"
              stroke="#fff"
              strokeWidth="1.5"
            />
            <text
              x={toSvgX(spec.tangentAt.x) + 7}
              y={toSvgY(spec.tangentAt.y) - 6}
              className="text-[11px] font-mono fill-amber-700 font-bold"
            >
              ({spec.tangentAt.x}, {spec.tangentAt.y})
            </text>
          </g>
        )}

        {/* Key Points */}
        {spec.points?.map((pt, pIdx) => {
          const sx = toSvgX(pt.x);
          const sy = toSvgY(pt.y);
          return (
            <g key={`pt-${pIdx}`}>
              <circle
                cx={sx}
                cy={sy}
                r="4.5"
                fill={pt.color || '#2563eb'}
                stroke="#ffffff"
                strokeWidth="1.5"
              />
              {pt.label && (
                <text
                  x={sx + 6}
                  y={sy - 6}
                  className="text-[11px] font-mono font-medium fill-slate-800"
                >
                  {pt.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};
