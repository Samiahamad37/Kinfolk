"use client";

import { useMemo, useState, useActionState } from "react";
import { Images, Search, Upload, FolderPlus, X } from "lucide-react";
import type { ActionState } from "@/actions/auth";
import { createAlbumAction, createPhotoAction } from "@/actions/family";
import { SubmitButton } from "@/components/SubmitButton";
import { fullName } from "@/lib/person-utils";

type PersonLite = {
  id: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
};

type AlbumLite = {
  id: string;
  title: string;
  coverUrl: string | null;
  description: string | null;
  year: string | null;
  _count: { photos: number };
};

type PhotoLite = {
  id: string;
  title: string;
  url: string;
  year: number | null;
  location: string | null;
  description: string | null;
  albumId: string | null;
  people: { person: PersonLite }[];
};

const initialState: ActionState = {};
const inputClass =
  "w-full rounded-md border border-[var(--line)] bg-[var(--cream-100)] px-3 py-2.5 text-sm outline-none ring-[var(--accent)] focus:ring-2";

export function PhotosBrowser({
  albums,
  photos,
}: {
  albums: AlbumLite[];
  photos: PhotoLite[];
}) {
  const [view, setView] = useState<"albums" | "all">("albums");
  const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [lightbox, setLightbox] = useState<PhotoLite | null>(null);
  const [showAlbumForm, setShowAlbumForm] = useState(false);
  const [showPhotoForm, setShowPhotoForm] = useState(false);

  const [albumState, albumAction] = useActionState(createAlbumAction, initialState);
  const [photoState, photoAction] = useActionState(createPhotoAction, initialState);

  const displayPhotos = useMemo(() => {
    let list = photos;
    if (selectedAlbum) list = list.filter((p) => p.albumId === selectedAlbum);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.location?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q),
      );
    }
    return list;
  }, [photos, selectedAlbum, searchQuery]);

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex overflow-hidden rounded-lg border border-[var(--line)]">
          {(["albums", "all"] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => {
                setView(v);
                setSelectedAlbum(null);
              }}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                view === v
                  ? "bg-[var(--accent-deep)] text-[#FDFAF6]"
                  : "bg-[var(--panel)] text-[var(--muted)]"
              }`}
            >
              {v === "albums" ? "Albums" : "All Photos"}
            </button>
          ))}
        </div>

        {view === "all" && (
          <div className="relative min-w-[200px] flex-1">
            <Search
              size={13}
              className="absolute top-1/2 left-3 -translate-y-1/2 text-[var(--muted)]"
            />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search photos…"
              className="w-full rounded-lg border border-[var(--line)] bg-[var(--panel)] py-2 pr-3 pl-9 text-sm outline-none"
            />
          </div>
        )}

        <div className="ml-auto flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              setShowAlbumForm((s) => !s);
              setShowPhotoForm(false);
            }}
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--line)] bg-[var(--panel)] px-4 py-2 text-sm font-medium text-[var(--ink)]"
          >
            <FolderPlus size={14} />
            New Album
          </button>
          <button
            type="button"
            onClick={() => {
              setShowPhotoForm((s) => !s);
              setShowAlbumForm(false);
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent-deep)] px-4 py-2 text-sm font-medium text-[#FDFAF6]"
          >
            <Upload size={14} />
            Add Photo
          </button>
        </div>
      </div>

      {showAlbumForm && (
        <form
          action={albumAction}
          className="grid gap-3 rounded-xl border border-[var(--line)] bg-[var(--panel)] p-5 sm:grid-cols-2"
        >
          <h3 className="font-display text-lg font-semibold text-[var(--ink)] sm:col-span-2">
            Create album
          </h3>
          <label className="block space-y-1.5 text-sm">
            <span className="text-[var(--muted)]">Title</span>
            <input name="title" required className={inputClass} />
          </label>
          <label className="block space-y-1.5 text-sm">
            <span className="text-[var(--muted)]">Year</span>
            <input name="year" placeholder="e.g. 1985" className={inputClass} />
          </label>
          <label className="block space-y-1.5 text-sm sm:col-span-2">
            <span className="text-[var(--muted)]">Cover URL (Unsplash)</span>
            <input
              name="coverUrl"
              type="url"
              placeholder="https://images.unsplash.com/..."
              className={inputClass}
            />
          </label>
          <label className="block space-y-1.5 text-sm sm:col-span-2">
            <span className="text-[var(--muted)]">Description</span>
            <textarea name="description" rows={2} className={inputClass} />
          </label>
          {albumState.error && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 sm:col-span-2">
              {albumState.error}
            </p>
          )}
          {albumState.success && (
            <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700 sm:col-span-2">
              {albumState.success}
            </p>
          )}
          <div className="sm:col-span-2">
            <SubmitButton label="Create album" pendingLabel="Creating…" />
          </div>
        </form>
      )}

      {showPhotoForm && (
        <form
          action={photoAction}
          className="grid gap-3 rounded-xl border border-[var(--line)] bg-[var(--panel)] p-5 sm:grid-cols-2"
        >
          <h3 className="font-display text-lg font-semibold text-[var(--ink)] sm:col-span-2">
            Add photo
          </h3>
          <label className="block space-y-1.5 text-sm">
            <span className="text-[var(--muted)]">Title</span>
            <input name="title" required className={inputClass} />
          </label>
          <label className="block space-y-1.5 text-sm">
            <span className="text-[var(--muted)]">Year</span>
            <input name="year" placeholder="e.g. 1992" className={inputClass} />
          </label>
          <label className="block space-y-1.5 text-sm sm:col-span-2">
            <span className="text-[var(--muted)]">Image URL (Unsplash)</span>
            <input
              name="url"
              type="url"
              required
              placeholder="https://images.unsplash.com/photo-...?"
              className={inputClass}
            />
          </label>
          <label className="block space-y-1.5 text-sm">
            <span className="text-[var(--muted)]">Album</span>
            <select name="albumId" className={inputClass} defaultValue={selectedAlbum ?? ""}>
              <option value="">No album</option>
              {albums.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.title}
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-1.5 text-sm">
            <span className="text-[var(--muted)]">Location</span>
            <input name="location" className={inputClass} />
          </label>
          <label className="block space-y-1.5 text-sm sm:col-span-2">
            <span className="text-[var(--muted)]">Description</span>
            <textarea name="description" rows={2} className={inputClass} />
          </label>
          <label className="block space-y-1.5 text-sm sm:col-span-2">
            <span className="text-[var(--muted)]">Person IDs (comma-separated)</span>
            <input name="personIds" placeholder="cuid1, cuid2" className={inputClass} />
          </label>
          {photoState.error && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 sm:col-span-2">
              {photoState.error}
            </p>
          )}
          {photoState.success && (
            <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700 sm:col-span-2">
              {photoState.success}
            </p>
          )}
          <div className="sm:col-span-2">
            <SubmitButton label="Add photo" pendingLabel="Uploading…" />
          </div>
        </form>
      )}

      {view === "albums" && !selectedAlbum && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {albums.length === 0 ? (
            <div className="col-span-full rounded-2xl border border-dashed border-[var(--line)] bg-[var(--panel)] p-12 text-center">
              <Images className="mx-auto mb-3 text-[var(--muted)]" size={32} />
              <p className="font-medium text-[var(--ink)]">No albums yet</p>
              <p className="mt-1 text-sm text-[var(--muted)]">Create an album to group family photos.</p>
            </div>
          ) : (
            albums.map((album) => (
              <button
                key={album.id}
                type="button"
                className="group overflow-hidden rounded-2xl border border-[var(--line)] text-left"
                onClick={() => {
                  setView("all");
                  setSelectedAlbum(album.id);
                }}
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-[#DED0C0]">
                  {album.coverUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={album.coverUrl}
                      alt={album.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[var(--muted)]">
                      <Images size={28} />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute right-0 bottom-0 left-0 p-4">
                    <div className="font-display text-base font-semibold text-white">{album.title}</div>
                    {album.year && <div className="text-xs text-[#C4AE98]">{album.year}</div>}
                  </div>
                </div>
                <div className="flex items-center justify-between bg-[var(--panel)] px-4 py-3">
                  <div className="line-clamp-1 text-[13px] text-[var(--muted)]">
                    {album.description ?? "Family album"}
                  </div>
                  <div className="shrink-0 text-xs font-semibold text-[var(--accent)]">
                    {album._count.photos} photos
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      )}

      {view === "all" && (
        <>
          {selectedAlbum && (
            <div className="flex items-center gap-2 text-sm">
              <button
                type="button"
                onClick={() => {
                  setView("albums");
                  setSelectedAlbum(null);
                }}
                className="text-[var(--accent)]"
              >
                ← Back to Albums
              </button>
              <span className="text-[var(--muted)]">·</span>
              <span className="text-[var(--muted)]">
                {albums.find((a) => a.id === selectedAlbum)?.title}
              </span>
            </div>
          )}

          <div className="columns-2 gap-3 space-y-3 sm:columns-3 lg:columns-4">
            {displayPhotos.map((photo) => (
              <button
                key={photo.id}
                type="button"
                className="group relative mb-3 block w-full break-inside-avoid overflow-hidden rounded-xl border border-[var(--line)] bg-[#DED0C0]"
                onClick={() => setLightbox(photo)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.url}
                  alt={photo.title}
                  className="w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="absolute right-0 bottom-0 left-0 p-3 opacity-0 transition-opacity group-hover:opacity-100">
                  <div className="text-left text-xs font-medium text-white">{photo.title}</div>
                  {photo.year && <div className="text-left text-[11px] text-[#C4AE98]">{photo.year}</div>}
                </div>
              </button>
            ))}
          </div>

          {displayPhotos.length === 0 && (
            <div className="rounded-2xl border border-dashed border-[var(--line)] bg-[var(--panel)] py-16 text-center">
              <p className="font-medium text-[var(--ink)]">No photos here yet</p>
              <p className="mt-1 text-sm text-[var(--muted)]">Add a photo with an Unsplash image URL.</p>
            </div>
          )}
        </>
      )}

      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={() => setLightbox(null)}
          onKeyDown={(e) => e.key === "Escape" && setLightbox(null)}
          role="dialog"
          aria-modal="true"
        >
          <div className="relative mx-6 w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={lightbox.url.replace(/w=\d+/, "w=900")}
              alt={lightbox.title}
              className="w-full rounded-2xl"
            />
            <div className="mt-4">
              <div className="font-display text-lg font-semibold text-white">{lightbox.title}</div>
              {(lightbox.year || lightbox.location) && (
                <div className="text-[13px] text-[#C4AE98]">
                  {[lightbox.year, lightbox.location].filter(Boolean).join(" · ")}
                </div>
              )}
              {lightbox.description && (
                <div className="mt-1 text-[13px] text-[#A89882]">{lightbox.description}</div>
              )}
              {lightbox.people.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {lightbox.people.map(({ person }) => (
                    <span
                      key={person.id}
                      className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs text-[#F0E8DC]"
                    >
                      {fullName(person)}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <button
              type="button"
              className="absolute -top-10 right-0 text-white/60 hover:text-white"
              onClick={() => setLightbox(null)}
            >
              <X size={24} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
