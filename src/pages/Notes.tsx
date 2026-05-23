import { useState, useEffect } from "react";
import { trpc } from "@/providers/trpc";
import { GlassButton } from "@/components/glass/GlassButton";
import { GlassInput } from "@/components/glass/GlassInput";
import { cn } from "@/lib/utils";
import {
  Folder,
  FileText,
  Plus,
  Search,
  Star,
  Trash2,
  ChevronRight,
  ChevronDown,
  Save,
  Tag,
  ArrowLeft,
} from "lucide-react";
import { useSearchParams } from "react-router";

export default function Notes() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedNoteId, setSelectedNoteId] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFolderId, setSelectedFolderId] = useState<number | undefined>();
  const [expandedFolders, setExpandedFolders] = useState<Set<number>>(new Set());
  const [showNewNote, setShowNewNote] = useState(searchParams.get("new") === "true");
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [showFavorites, setShowFavorites] = useState(false);

  const utils = trpc.useUtils();
  const { data: folders } = trpc.folders.list.useQuery();
  const { data: notes } = trpc.notes.list.useQuery({
    folderId: showFavorites ? undefined : selectedFolderId,
    search: searchQuery || undefined,
    favorite: showFavorites || undefined,
  });
  const { data: selectedNote } = trpc.notes.getById.useQuery(
    { id: selectedNoteId! },
    { enabled: selectedNoteId !== null }
  );

  const createNote = trpc.notes.create.useMutation({
    onSuccess: () => {
      utils.notes.list.invalidate();
      setShowNewNote(false);
      setEditTitle("");
      setEditContent("");
      setIsEditing(false);
      setSearchParams({});
    },
  });

  const updateNote = trpc.notes.update.useMutation({
    onSuccess: () => {
      utils.notes.list.invalidate();
      utils.notes.getById.invalidate({ id: selectedNoteId! });
      setIsEditing(false);
    },
  });

  const deleteNote = trpc.notes.delete.useMutation({
    onSuccess: () => {
      utils.notes.list.invalidate();
      setSelectedNoteId(null);
      setIsEditing(false);
    },
  });

  const toggleFavorite = trpc.notes.update.useMutation({
    onSuccess: () => {
      utils.notes.list.invalidate();
      utils.notes.getById.invalidate({ id: selectedNoteId! });
    },
  });

  const createFolder = trpc.folders.create.useMutation({
    onSuccess: () => {
      utils.folders.list.invalidate();
      setShowNewFolder(false);
      setNewFolderName("");
    },
  });

  const deleteFolder = trpc.folders.delete.useMutation({
    onSuccess: () => {
      utils.folders.list.invalidate();
      setSelectedFolderId(undefined);
    },
  });

  useEffect(() => {
    if (selectedNote) {
      setEditTitle(selectedNote.title);
      setEditContent(selectedNote.content ?? "");
    }
  }, [selectedNote]);

  const toggleFolder = (id: number) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSave = () => {
    if (!editTitle.trim()) return;
    if (selectedNoteId) {
      updateNote.mutate({ id: selectedNoteId, title: editTitle, content: editContent });
    } else {
      createNote.mutate({ title: editTitle, content: editContent, folderId: selectedFolderId });
    }
  };

  const handleNewNote = () => {
    setSelectedNoteId(null);
    setEditTitle("");
    setEditContent("");
    setIsEditing(true);
    setShowNewNote(true);
  };

  const allNotes = notes ?? [];
  const folderTree = buildFolderTree(folders ?? []);

  return (
    <div className="flex h-full">
      {/* ─── Folder Sidebar ─────────────────────────── */}
      <aside className="w-60 glass-sidebar flex flex-col border-r border-white/5">
        <div className="p-4 border-b border-white/5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-sm font-semibold text-white">Folders</h2>
            <button
              onClick={() => setShowNewFolder(!showNewFolder)}
              className="p-1 rounded-lg hover:bg-white/10 text-[#8B8B96] hover:text-white transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          {showNewFolder && (
            <div className="flex gap-2">
              <GlassInput
                className="text-xs py-1.5"
                placeholder="Folder name..."
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newFolderName.trim()) {
                    createFolder.mutate({ name: newFolderName });
                  }
                }}
                autoFocus
              />
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {/* All Notes */}
          <button
            onClick={() => { setSelectedFolderId(undefined); setShowFavorites(false); }}
            className={cn(
              "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
              selectedFolderId === undefined && !showFavorites
                ? "bg-white/10 text-white"
                : "text-[#8B8B96] hover:text-white hover:bg-white/5"
            )}
          >
            <FileText className="w-4 h-4" />
            <span>All Notes</span>
            <span className="ml-auto text-xs text-[#8B8B96]">{allNotes.length}</span>
          </button>

          {/* Favorites */}
          <button
            onClick={() => { setShowFavorites(true); setSelectedFolderId(undefined); }}
            className={cn(
              "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
              showFavorites
                ? "bg-white/10 text-white"
                : "text-[#8B8B96] hover:text-white hover:bg-white/5"
            )}
          >
            <Star className="w-4 h-4" />
            <span>Favorites</span>
          </button>

          {/* Folder Tree */}
          <div className="mt-2">
            {folderTree.map((folder) => (
              <FolderTreeItem
                key={folder.id}
                folder={folder}
                selectedFolderId={selectedFolderId}
                expandedFolders={expandedFolders}
                onToggle={toggleFolder}
                onSelect={setSelectedFolderId}
                onDelete={(id) => deleteFolder.mutate({ id })}
                level={0}
              />
            ))}
          </div>
        </div>
      </aside>

      {/* ─── Note List ────────────────────────────────── */}
      <div className="w-72 border-r border-white/5 flex flex-col" style={{ background: "rgba(3, 3, 5, 0.5)" }}>
        <div className="p-4 border-b border-white/5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-sm font-semibold text-white">Notes</h2>
            <GlassButton size="sm" onClick={handleNewNote}>
              <Plus className="w-3 h-3" />
              New
            </GlassButton>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B8B96]" />
            <GlassInput
              className="pl-9 text-sm py-2"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto" role="list" aria-label="Note list">
          {allNotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-[#8B8B96]">
              <FileText className="w-12 h-12 mb-3 opacity-30" />
              <p className="text-sm">No notes yet</p>
              <p className="text-xs mt-1">Create your first note</p>
            </div>
          ) : (
            allNotes.map((note) => (
              <button
                key={note.id}
                role="listitem"
                onClick={() => {
                  setSelectedNoteId(note.id);
                  setIsEditing(false);
                  setShowNewNote(false);
                }}
                className={cn(
                  "w-full text-left p-3 border-b border-white/5 transition-colors group",
                  selectedNoteId === note.id
                    ? "bg-white/10"
                    : "hover:bg-white/5"
                )}
              >
                <div className="flex items-start gap-2">
                  <FileText className="w-4 h-4 text-[#8B8B96] flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-white truncate">{note.title}</span>
                      {note.isFavorite && <Star className="w-3 h-3 text-[#2DD4BF] flex-shrink-0" />}
                    </div>
                    <p className="text-xs text-[#8B8B96] truncate mt-0.5">
                      {note.content?.slice(0, 60) || "No content"}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      {note.tags?.map((tag) => (
                        <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/5 text-[#8B8B96]">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* ─── Editor ───────────────────────────────────── */}
      <div className="flex-1 flex flex-col" style={{ background: "rgba(3, 3, 5, 0.3)" }}>
        {showNewNote || selectedNoteId ? (
          <>
            {/* Editor Toolbar */}
            <div className="flex items-center justify-between p-4 border-b border-white/5">
              <div className="flex items-center gap-3">
                {selectedNoteId && (
                  <button
                    onClick={() => {
                      setSelectedNoteId(null);
                      setIsEditing(false);
                    }}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-[#8B8B96] hover:text-white transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                )}
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => {
                    setEditTitle(e.target.value);
                    setIsEditing(true);
                  }}
                  placeholder="Note title..."
                  className="bg-transparent text-lg font-display font-semibold text-white placeholder:text-[#8B8B96]/50 outline-none flex-1"
                />
              </div>
              <div className="flex items-center gap-2">
                {selectedNoteId && (
                  <button
                    onClick={() =>
                      toggleFavorite.mutate({
                        id: selectedNoteId,
                        isFavorite: !selectedNote?.isFavorite,
                      })
                    }
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <Star
                      className={cn(
                        "w-4 h-4",
                        selectedNote?.isFavorite
                          ? "text-[#2DD4BF]"
                          : "text-[#8B8B96]"
                      )}
                    />
                  </button>
                )}
                <GlassButton size="sm" onClick={handleSave}>
                  <Save className="w-3 h-3" />
                  Save
                </GlassButton>
                {selectedNoteId && (
                  <button
                    onClick={() => {
                      if (confirm("Delete this note?")) {
                        deleteNote.mutate({ id: selectedNoteId });
                      }
                    }}
                    className="p-2 rounded-lg hover:bg-red-500/10 text-[#8B8B96] hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Editor Content */}
            <div className="flex-1 p-6 overflow-y-auto">
              <textarea
                value={editContent}
                onChange={(e) => {
                  setEditContent(e.target.value);
                  setIsEditing(true);
                }}
                placeholder="Start writing... Use # for tags, [[ for links"
                className="w-full h-full bg-transparent text-white placeholder:text-[#8B8B96]/30 outline-none resize-none leading-relaxed font-mono-display text-sm"
              />
            </div>

            {/* Editor Footer */}
            <div className="px-4 py-2 border-t border-white/5 flex items-center justify-between text-xs text-[#8B8B96]">
              <div className="flex items-center gap-4">
                <span>{editContent.length} chars</span>
                <span>{editContent.split(/\s+/).filter(Boolean).length} words</span>
                {isEditing && <span className="text-[#2DD4BF]">Unsaved changes</span>}
              </div>
              <div className="flex items-center gap-2">
                <Tag className="w-3 h-3" />
                <span>Markdown supported</span>
              </div>
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="flex-1 flex flex-col items-center justify-center text-[#8B8B96]">
            <FileText className="w-16 h-16 mb-4 opacity-20" />
            <p className="text-lg font-display">Select a note or create one</p>
            <p className="text-sm mt-2">Your thoughts deserve to be recorded</p>
            <GlassButton className="mt-6" onClick={handleNewNote}>
              <Plus className="w-4 h-4" />
              Create Note
            </GlassButton>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Folder Tree Item ────────────────────────────────
interface FolderNode {
  id: number;
  name: string;
  children: FolderNode[];
}

function buildFolderTree(folders: { id: number; name: string; parentId: number | null }[]): FolderNode[] {
  const nodeMap = new Map<number, FolderNode>();
  const roots: FolderNode[] = [];

  for (const f of folders) {
    nodeMap.set(f.id, { id: f.id, name: f.name, children: [] });
  }

  for (const f of folders) {
    const node = nodeMap.get(f.id)!;
    if (f.parentId && nodeMap.has(f.parentId)) {
      nodeMap.get(f.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

function FolderTreeItem({
  folder,
  selectedFolderId,
  expandedFolders,
  onToggle,
  onSelect,
  onDelete,
  level,
}: {
  folder: FolderNode;
  selectedFolderId: number | undefined;
  expandedFolders: Set<number>;
  onToggle: (id: number) => void;
  onSelect: (id: number | undefined) => void;
  onDelete: (id: number) => void;
  level: number;
}) {
  const isExpanded = expandedFolders.has(folder.id);
  const isSelected = selectedFolderId === folder.id;
  const hasChildren = folder.children.length > 0;

  return (
    <div>
      <div className="flex items-center group">
        <button
          onClick={() => onSelect(folder.id)}
          className={cn(
            "flex-1 flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors",
            isSelected
              ? "bg-white/10 text-white"
              : "text-[#8B8B96] hover:text-white hover:bg-white/5"
          )}
          style={{ paddingLeft: `${12 + level * 16}px` }}
        >
          {hasChildren ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggle(folder.id);
              }}
              className="flex-shrink-0"
            >
              {isExpanded ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronRight className="w-3 h-3" />
              )}
            </button>
          ) : (
            <span className="w-3" />
          )}
          <Folder className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">{folder.name}</span>
        </button>
        <button
          onClick={() => {
            if (confirm(`Delete folder "${folder.name}"?`)) {
              onDelete(folder.id);
            }
          }}
          className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-white/10 text-[#8B8B96] hover:text-red-400 transition-all"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
      {isExpanded && hasChildren && (
        <div>
          {folder.children.map((child) => (
            <FolderTreeItem
              key={child.id}
              folder={child}
              selectedFolderId={selectedFolderId}
              expandedFolders={expandedFolders}
              onToggle={onToggle}
              onSelect={onSelect}
              onDelete={onDelete}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
