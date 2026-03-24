"use client"

import { useState, useCallback } from "react"
import { MemeCard } from "./meme-card"
import { GallerySearch } from "./gallery-search"
import type { MemeTemplate } from "@/lib/types"

interface MemeGalleryProps {
  initialMemes: MemeTemplate[]
}

export function MemeGallery({ initialMemes }: MemeGalleryProps) {
  const [query, setQuery] = useState("")

  const filtered = query.trim()
    ? initialMemes.filter((m) =>
        m.name.toLowerCase().includes(query.toLowerCase())
      )
    : initialMemes

  const handleSearch = useCallback((q: string) => setQuery(q), [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <GallerySearch onSearch={handleSearch} />
        <p className="text-sm text-muted-foreground whitespace-nowrap">
          {filtered.length} meme{filtered.length !== 1 ? "s" : ""}
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg font-medium">No memes found</p>
          <p className="text-sm mt-1">Try a different search term</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map((meme) => (
            <MemeCard key={meme.id} meme={meme} />
          ))}
        </div>
      )}
    </div>
  )
}
