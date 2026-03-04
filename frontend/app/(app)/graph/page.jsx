'use client'

import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { getGraph } from '@/lib/api'

const TYPE_COLOR = {
  meeting:  '#a78bfa',
  journal:  '#34d399',
  todo:     '#fbbf24',
  research: '#60a5fa',
  general:  '#AEADA9',
}

export default function KnowledgeGraph() {
  const router = useRouter()
  const svgRef = useRef(null)
  const [tooltip, setTooltip] = useState(null) // { x, y, title, type }
  const [stats, setStats] = useState({ nodes: 0, edges: 0 })

  const { data, isLoading } = useQuery({
    queryKey: ['graph'],
    queryFn: getGraph,
  })

  useEffect(() => {
    if (!data || !svgRef.current) return

    const nodes = data.nodes.map((n) => ({ ...n, id: String(n.id) }))
    const edges = data.edges.map((e) => ({
      ...e,
      source: String(e.source),
      target: String(e.target),
    }))

    setStats({ nodes: nodes.length, edges: edges.length })

    const el = svgRef.current
    const W = el.clientWidth
    const H = el.clientHeight

    // Clear previous render
    d3.select(el).selectAll('*').remove()

    const svg = d3.select(el)

    // Zoom / pan
    const g = svg.append('g')
    svg.call(
      d3.zoom()
        .scaleExtent([0.2, 4])
        .on('zoom', (event) => g.attr('transform', event.transform))
    )

    // Simulation
    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(edges).id((d) => d.id).distance(120))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(W / 2, H / 2))
      .force('collision', d3.forceCollide(36))

    // Edges
    const link = g.append('g')
      .selectAll('line')
      .data(edges)
      .join('line')
      .attr('stroke', 'var(--border)')
      .attr('stroke-width', 1.5)
      .attr('stroke-opacity', 0.6)

    // Node groups
    const node = g.append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .style('cursor', 'pointer')
      .call(
        d3.drag()
          .on('start', (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart()
            d.fx = d.x; d.fy = d.y
          })
          .on('drag', (event, d) => { d.fx = event.x; d.fy = event.y })
          .on('end', (event, d) => {
            if (!event.active) simulation.alphaTarget(0)
            d.fx = null; d.fy = null
          })
      )

    // Circle
    node.append('circle')
      .attr('r', 18)
      .attr('fill', (d) => TYPE_COLOR[d.note_type] ?? TYPE_COLOR.general)
      .attr('fill-opacity', 0.15)
      .attr('stroke', (d) => TYPE_COLOR[d.note_type] ?? TYPE_COLOR.general)
      .attr('stroke-width', 1.5)

    // Label (truncated)
    node.append('text')
      .text((d) => d.title.length > 12 ? d.title.slice(0, 12) + '…' : d.title)
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('font-size', 9)
      .attr('font-family', 'var(--font-geist-mono), ui-monospace, monospace')
      .attr('fill', 'var(--text-primary)')
      .attr('pointer-events', 'none')

    // Hover & click
    node
      .on('mouseenter', (event, d) => {
        const rect = el.getBoundingClientRect()
        setTooltip({
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
          title: d.title,
          type: d.note_type,
        })
        d3.select(event.currentTarget).select('circle')
          .attr('fill-opacity', 0.35)
          .attr('stroke-width', 2.5)
      })
      .on('mousemove', (event) => {
        const rect = el.getBoundingClientRect()
        setTooltip((t) => t ? { ...t, x: event.clientX - rect.left, y: event.clientY - rect.top } : null)
      })
      .on('mouseleave', (event) => {
        setTooltip(null)
        d3.select(event.currentTarget).select('circle')
          .attr('fill-opacity', 0.15)
          .attr('stroke-width', 1.5)
      })
      .on('click', (_, d) => router.push(`/note/${d.id}`))

    simulation.on('tick', () => {
      link
        .attr('x1', (d) => d.source.x)
        .attr('y1', (d) => d.source.y)
        .attr('x2', (d) => d.target.x)
        .attr('y2', (d) => d.target.y)
      node.attr('transform', (d) => `translate(${d.x},${d.y})`)
    })

    return () => simulation.stop()
  }, [data])

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--bg-editor)' }}>

      {/* Header */}
      <div
        className="flex items-center justify-between px-8 shrink-0"
        style={{ height: '56px', borderBottom: '1px solid var(--border)' }}
      >
        <div>
          <h1 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Knowledge Graph</h1>
          <p className="text-[10px] font-mono mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
            {stats.nodes} notes · {stats.edges} connections
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3">
          {Object.entries(TYPE_COLOR).map(([type, color]) => (
            <span key={type} className="flex items-center gap-1 text-[10px] font-mono" style={{ color: 'var(--text-tertiary)' }}>
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
              {type}
            </span>
          ))}
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 relative min-h-0">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-4 h-4 rounded-full border-2 animate-spin"
              style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent)' }} />
          </div>
        ) : data?.nodes?.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2">
            <p className="text-sm font-mono" style={{ color: 'var(--text-tertiary)' }}>No notes yet</p>
            <p className="text-xs font-mono" style={{ color: 'var(--text-placeholder)' }}>Create some notes and they'll appear here</p>
          </div>
        ) : (
          <>
            <svg ref={svgRef} className="w-full h-full" />

            {/* Tooltip */}
            {tooltip && (
              <div
                className="absolute pointer-events-none rounded-lg px-3 py-2 text-[11px] font-mono shadow-lg z-10"
                style={{
                  left: tooltip.x + 14,
                  top: tooltip.y - 12,
                  background: '#1C1B18',
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <span className="w-2 h-2 rounded-full inline-block mr-1.5"
                  style={{ background: TYPE_COLOR[tooltip.type] ?? TYPE_COLOR.general }} />
                {tooltip.title}
              </div>
            )}

            {/* Hint */}
            <p className="absolute bottom-4 right-6 text-[10px] font-mono" style={{ color: 'var(--text-placeholder)' }}>
              scroll to zoom · drag to pan · click a node to open note
            </p>
          </>
        )}
      </div>
    </div>
  )
}
