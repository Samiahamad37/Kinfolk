"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ZoomIn, ZoomOut, Crosshair, Search, GitBranch } from "lucide-react";
import { CARD_H, CARD_W, type TreeLayout } from "@/lib/tree-layout";
import { fullName, initials, parseYear, avatarColor, type PersonLike } from "@/lib/person-utils";

type Person = PersonLike & { occupation?: string | null };

type Props = {
  people: Person[];
  layout: TreeLayout;
  currentUserName?: string;
};

export function InteractiveTree({ people, layout }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [zoom, setZoom] = useState(0.85);
  const [pan, setPan] = useState({ x: 40, y: 30 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, px: 0, py: 0 });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Person[]>([]);

  const byId = Object.fromEntries(people.map((p) => [p.id, p]));

  function openPerson(id: string) {
    setSelectedId(id);
    const params = new URLSearchParams(searchParams.toString());
    params.set("person", id);
    router.push(`${pathname}?${params.toString()}`);
  }

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.08 : 0.08;
    setZoom((z) => Math.max(0.35, Math.min(2, z + delta)));
  }, []);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if ((e.target as HTMLElement).closest(".person-card")) return;
      setDragging(true);
      dragStart.current = { x: e.clientX, y: e.clientY, px: pan.x, py: pan.y };
      e.currentTarget.setPointerCapture(e.pointerId);
    },
    [pan],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging) return;
      setPan({
        x: dragStart.current.px + (e.clientX - dragStart.current.x),
        y: dragStart.current.py + (e.clientY - dragStart.current.y),
      });
    },
    [dragging],
  );

  const connections: React.ReactNode[] = [];
  for (const couple of layout.couples) {
    const p1 = layout.positions[couple.p1];
    if (!p1) continue;
    if (couple.p2) {
      const p2 = layout.positions[couple.p2];
      if (p2) {
        const y = p1.y + CARD_H / 2;
        connections.push(
          <line
            key={`spouse-${couple.id}`}
            x1={p1.cx + CARD_W / 2}
            y1={y}
            x2={p2.cx - CARD_W / 2}
            y2={y}
            stroke="#C17E4A"
            strokeWidth={1.5}
            strokeDasharray="4 3"
            opacity={0.7}
          />,
        );
      }
    }
    if (!couple.children.length) continue;
    const mid = couple.p2
      ? ((layout.positions[couple.p1]?.cx ?? 0) + (layout.positions[couple.p2]?.cx ?? 0)) / 2
      : p1.cx;
    const bottomY = p1.y + CARD_H;
    const junctionY = bottomY + 44;
    const childXs = couple.children.map((cid) => layout.positions[cid]?.cx).filter(Boolean) as number[];
    if (!childXs.length) continue;
    const childTopY = layout.positions[couple.children[0]]?.y ?? junctionY + 40;
    const leftMost = Math.min(mid, ...childXs);
    const rightMost = Math.max(mid, ...childXs);
    connections.push(
      <line key={`v-${couple.id}`} x1={mid} y1={bottomY} x2={mid} y2={junctionY} stroke="#DED0C0" strokeWidth={1.5} />,
      <line
        key={`h-${couple.id}`}
        x1={leftMost}
        y1={junctionY}
        x2={rightMost}
        y2={junctionY}
        stroke="#DED0C0"
        strokeWidth={1.5}
      />,
    );
    couple.children.forEach((childId) => {
      const cx = layout.positions[childId]?.cx;
      if (cx == null) return;
      connections.push(
        <line
          key={`c-${couple.id}-${childId}`}
          x1={cx}
          y1={junctionY}
          x2={cx}
          y2={childTopY}
          stroke="#DED0C0"
          strokeWidth={1.5}
        />,
      );
    });
  }

  function handleSearch(q: string) {
    setSearchQuery(q);
    if (!q.trim()) {
      setSearchResults([]);
      return;
    }
    const lower = q.toLowerCase();
    setSearchResults(
      people
        .filter(
          (p) =>
            fullName(p).toLowerCase().includes(lower) ||
            p.occupation?.toLowerCase().includes(lower),
        )
        .slice(0, 6),
    );
  }

  const genCounts = layout.generations.map(
    (g) => Object.values(layout.generationOf).filter((v) => v === g).length,
  );

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 57px)" }}>
      <div className="flex flex-wrap items-center gap-3 border-b border-[var(--line)] bg-[var(--panel)] px-5 py-3">
        <div className="relative">
          <Search
            size={14}
            className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-[var(--muted)]"
          />
          <input
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search family members…"
            className="w-52 rounded-lg border border-[var(--line)] bg-transparent py-1.5 pr-3 pl-8 text-[13px] text-[var(--ink)] outline-none"
          />
          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 z-10 mt-1 w-60 overflow-hidden rounded-lg border border-[var(--line)] bg-[var(--panel)] shadow-xl">
              {searchResults.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-[var(--cream-100)]"
                  onClick={() => {
                    openPerson(p.id);
                    setSearchQuery("");
                    setSearchResults([]);
                  }}
                >
                  <span
                    className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold text-white"
                    style={{ background: avatarColor(layout.generationOf[p.id] ?? 0) }}
                  >
                    {initials(p)}
                  </span>
                  <span>
                    <div className="text-[13px] text-[var(--ink)]">{fullName(p)}</div>
                    <div className="text-[11px] text-[var(--muted)]">
                      Gen {(layout.generationOf[p.id] ?? 0) + 1}
                    </div>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          <ToolbarBtn onClick={() => setZoom((z) => Math.min(2, z + 0.12))}>
            <ZoomIn size={14} />
          </ToolbarBtn>
          <ToolbarBtn onClick={() => setZoom((z) => Math.max(0.35, z - 0.12))}>
            <ZoomOut size={14} />
          </ToolbarBtn>
          <ToolbarBtn
            onClick={() => {
              setPan({ x: 40, y: 30 });
              setZoom(0.85);
            }}
          >
            <Crosshair size={14} />
          </ToolbarBtn>
        </div>
        <div className="text-xs text-[var(--muted)]">{Math.round(zoom * 100)}%</div>

        <div className="ml-auto hidden items-center gap-4 md:flex">
          {layout.generations.map((g) => (
            <div key={g} className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full" style={{ background: avatarColor(g) }} />
              <span className="text-[11px] text-[var(--muted)]">
                Gen {g + 1} ({genCounts[g]})
              </span>
            </div>
          ))}
        </div>
      </div>

      <div
        className="tree-canvas-wrapper relative flex-1 overflow-hidden"
        style={{ background: "var(--background)", cursor: dragging ? "grabbing" : "grab" }}
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={() => setDragging(false)}
        onPointerLeave={() => setDragging(false)}
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(139,94,60,0.15) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: "0 0",
            position: "relative",
            width: layout.canvasWidth,
            height: layout.canvasHeight,
          }}
        >
          <svg
            width={layout.canvasWidth}
            height={layout.canvasHeight}
            className="pointer-events-none absolute inset-0"
          >
            {connections}
          </svg>

          {Object.entries(layout.positions).map(([id, pos]) => {
            const person = byId[id];
            if (!person) return null;
            const gen = layout.generationOf[id] ?? 0;
            const birth = parseYear(person.birthDate);
            const death = parseYear(person.deathDate);
            const selected = selectedId === id;
            return (
              <button
                key={id}
                type="button"
                className={`person-card text-left ${selected ? "highlighted" : ""}`}
                style={{ left: pos.cx - CARD_W / 2, top: pos.y, width: CARD_W }}
                onClick={() => openPerson(id)}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-[#FDFAF6]"
                    style={{ background: avatarColor(gen) }}
                  >
                    {initials(person)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-xs font-semibold text-[var(--ink)]">
                      {person.firstName} {person.lastName}
                    </div>
                    <div className="text-[10.5px] text-[var(--muted)]">
                      {birth ?? "?"}
                      {death ? ` – ${death}` : ""}
                    </div>
                  </div>
                </div>
                <div className="mt-1.5 truncate border-t border-[var(--line)] pt-1.5 text-[10px] text-[var(--muted)]">
                  {person.occupation ?? "Family member"}
                </div>
              </button>
            );
          })}
        </div>

        <div className="pointer-events-none absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-[var(--line)] bg-[var(--panel)] px-3 py-1.5 text-[11px] text-[var(--muted)]">
          <GitBranch size={11} />
          Scroll to zoom · Drag to pan · Click a card to view profile
        </div>
      </div>
    </div>
  );
}

function ToolbarBtn({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--line)] text-[var(--muted)] hover:opacity-80"
    >
      {children}
    </button>
  );
}
