import { useEffect, useRef, useMemo } from "react";
import { trpc } from "@/providers/trpc";
import { GlassCard } from "@/components/glass/GlassCard";
import { GlassButton } from "@/components/glass/GlassButton";
import { Link } from "react-router";
import { Sparkles, FileText } from "lucide-react";

interface GraphNode {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  title: string;
  radius: number;
}

interface GraphEdge {
  source: string;
  target: string;
}

export default function Graph() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { data: notesList } = trpc.notes.list.useQuery({});

  const { nodes, edges } = useMemo(() => {
    if (!notesList?.length) return { nodes: [], edges: [] };

    const nodeMap = new Map<string, GraphNode>();
    const edgeList: GraphEdge[] = [];

    notesList.forEach((note, i) => {
      const angle = (i / notesList.length) * Math.PI * 2;
      const radius = 150 + Math.random() * 100;
      nodeMap.set(String(note.id), {
        id: String(note.id),
        x: 400 + Math.cos(angle) * radius,
        y: 300 + Math.sin(angle) * radius,
        vx: 0,
        vy: 0,
        title: note.title,
        radius: 8 + (note.title.length % 5),
      });

      if (note.linksTo?.length) {
        note.linksTo.forEach((linkId) => {
          if (nodeMap.has(linkId) || notesList.some((n) => String(n.id) === linkId)) {
            edgeList.push({ source: String(note.id), target: linkId });
          }
        });
      }
    });

    // Create edges from content references
    notesList.forEach((note) => {
      const content = note.content ?? "";
      const matches = content.match(/\[\[(.*?)\]\]/g);
      if (matches) {
        matches.forEach((match) => {
          const title = match.slice(2, -2);
          const target = notesList.find((n) => n.title === title);
          if (target && target.id !== note.id) {
            const exists = edgeList.some(
              (e) =>
                (e.source === String(note.id) && e.target === String(target.id)) ||
                (e.source === String(target.id) && e.target === String(note.id))
            );
            if (!exists) {
              edgeList.push({ source: String(note.id), target: String(target.id) });
            }
          }
        });
      }
    });

    return { nodes: Array.from(nodeMap.values()), edges: edgeList };
  }, [notesList]);

  useEffect(() => {
    if (!nodes.length || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = canvas.offsetWidth;
    let height = canvas.offsetHeight;
    const dpr = Math.min(window.devicePixelRatio, 2);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const nodeMap = new Map(nodes.map((n) => [n.id, { ...n }]));
    const mouse = { x: width / 2, y: height / 2, active: false };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
    };

    const handleMouseLeave = () => {
      mouse.active = false;
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);

    let rafId: number;

    const animate = () => {
      ctx!.clearRect(0, 0, width, height);

      // Draw background
      ctx!.fillStyle = "rgba(3, 3, 5, 0.3)";
      ctx!.fillRect(0, 0, width, height);

      // Center nodes
      const cx = width / 2;
      const cy = height / 2;

      // Update positions
      for (const node of nodeMap.values()) {
        const dx = cx - node.x;
        const dy = cy - node.y;
        node.vx += dx * 0.001;
        node.vy += dy * 0.001;

        if (mouse.active) {
          const mdx = node.x - mouse.x;
          const mdy = node.y - mouse.y;
          const dist = Math.sqrt(mdx * mdx + mdy * mdy);
          if (dist < 150 && dist > 0) {
            const force = (150 - dist) / 150;
            node.vx += (mdx / dist) * force * 2;
            node.vy += (mdy / dist) * force * 2;
          }
        }

        node.vx *= 0.95;
        node.vy *= 0.95;
        node.x += node.vx;
        node.y += node.vy;

        node.x = Math.max(50, Math.min(width - 50, node.x));
        node.y = Math.max(50, Math.min(height - 50, node.y));
      }

      // Draw edges
      for (const edge of edges) {
        const source = nodeMap.get(edge.source);
        const target = nodeMap.get(edge.target);
        if (!source || !target) continue;

        const dist = Math.sqrt(
          (target.x - source.x) ** 2 + (target.y - source.y) ** 2
        );
        const alpha = Math.max(0.05, 1 - dist / 400);

        ctx!.beginPath();
        ctx!.moveTo(source.x, source.y);
        ctx!.lineTo(target.x, target.y);
        ctx!.strokeStyle = `rgba(109, 40, 217, ${alpha * 0.5})`;
        ctx!.lineWidth = 1;
        ctx!.stroke();
      }

      // Draw nodes
      for (const node of nodeMap.values()) {
        // Glow
        const gradient = ctx!.createRadialGradient(
          node.x, node.y, 0,
          node.x, node.y, node.radius * 3
        );
        gradient.addColorStop(0, "rgba(109, 40, 217, 0.4)");
        gradient.addColorStop(1, "rgba(109, 40, 217, 0)");
        ctx!.fillStyle = gradient;
        ctx!.beginPath();
        ctx!.arc(node.x, node.y, node.radius * 3, 0, Math.PI * 2);
        ctx!.fill();

        // Core
        ctx!.fillStyle = "#6D28D9";
        ctx!.beginPath();
        ctx!.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx!.fill();

        // Highlight
        ctx!.fillStyle = "rgba(255, 255, 255, 0.3)";
        ctx!.beginPath();
        ctx!.arc(node.x - 2, node.y - 2, node.radius * 0.4, 0, Math.PI * 2);
        ctx!.fill();

        // Label
        ctx!.fillStyle = "rgba(232, 232, 236, 0.7)";
        ctx!.font = "11px Inter, sans-serif";
        ctx!.textAlign = "center";
        ctx!.fillText(node.title.slice(0, 15), node.x, node.y + node.radius + 14);
      }

      rafId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      width = canvas.offsetWidth;
      height = canvas.offsetHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(rafId);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("resize", handleResize);
    };
  }, [nodes, edges]);

  const isEmpty = !notesList || notesList.length <= 1;

  return (
    <div className="h-full flex flex-col p-6 animate-page-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="font-display text-xl font-bold text-white">
            Knowledge Graph
          </h1>
          <p className="text-xs text-[#8B8B96] mt-0.5">
            Visualize connections between your notes
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs text-[#8B8B96]">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#6D28D9]" />
            {nodes.length} Nodes
          </span>
          <span className="flex items-center gap-2">
            <span className="w-4 h-px bg-[#6D28D9]/50" />
            {edges.length} Links
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0">
        {isEmpty ? (
          /* Empty State */
          <div className="w-full h-full flex flex-col items-center justify-center glass-card">
            <div className="relative z-10 text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#6D28D9]/10 flex items-center justify-center mx-auto mb-5">
                <Sparkles className="w-8 h-8 text-[#6D28D9]/40" />
              </div>
              <h3 className="font-display text-lg font-semibold text-white mb-2">
                Your Knowledge Graph is Growing
              </h3>
              <p className="text-sm text-[#8B8B96] max-w-sm mx-auto mb-6 leading-relaxed">
                Create more notes and use <code className="text-[#A78BFA] bg-white/5 px-1 rounded">[[Note Title]]</code> to link them together.
                The graph will automatically show connections.
              </p>
              <Link to="/notes">
                <GlassButton variant="primary">
                  <FileText className="w-4 h-4" />
                  Write a Note
                </GlassButton>
              </Link>
            </div>
          </div>
        ) : (
          <GlassCard className="w-full h-full relative overflow-hidden p-0" hover={false}>
            <canvas
              ref={canvasRef}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
              }}
            />
          </GlassCard>
        )}
      </div>
    </div>
  );
}
