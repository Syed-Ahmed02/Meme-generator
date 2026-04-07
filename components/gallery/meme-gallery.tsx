"use client"

import { useState, useCallback, useRef } from "react"
import { Loader2 } from "lucide-react"
import { MemeCard } from "./meme-card"
import { GallerySearch } from "./gallery-search"
import { Button } from "@/components/ui/button"
import type { MemeTemplate } from "@/lib/types"

interface MemeGalleryProps {
  initialMemes: MemeTemplate[]
  initialNextCursor: string
}

export function MemeGallery({ initialMemes, initialNextCursor }: MemeGalleryProps) {
  const [memes, setMemes] = useState<MemeTemplate[]>(initialMemes)
  const [nextCursor, setNextCursor] = useState(initialNextCursor)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const currentQuery = useRef("")

  const fetchMemes = useCallback(async (cursor: string, query: string) => {
    const params = new URLSearchParams()
    if (cursor) params.set("cursor", cursor)
    if (query.trim()) params.set("q", query.trim())

    const res = await fetch(`/api/memes?${params}`)
    if (!res.ok) throw new Error("Failed to fetch memes")
    return res.json() as Promise<{ memes: MemeTemplate[]; nextCursor: string }>
  }, [])

  const handleSearch = useCallback(
    async (query: string) => {
      currentQuery.current = query
      setIsSearching(true)
      try {
        const data = await fetchMemes("", query)
        // Guard against stale responses if user typed faster
        if (currentQuery.current !== query) return
        setMemes(data.memes)
        setNextCursor(data.nextCursor ?? "")
      } catch {
        // silently keep current results on search error
      } finally {
        if (currentQuery.current === query) setIsSearching(false)
      }
    },
    [fetchMemes]
  )

  const handleLoadMore = useCallback(async () => {
    if (!nextCursor || isLoadingMore) return
    setIsLoadingMore(true)
    try {
      const data = await fetchMemes(nextCursor, currentQuery.current)
      setMemes((prev) => [...prev, ...data.memes])
      setNextCursor(data.nextCursor ?? "")
    } catch {
      // silently fail — user can retry
    } finally {
      setIsLoadingMore(false)
    }
  }, [nextCursor, isLoadingMore, fetchMemes])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <GallerySearch onSearch={handleSearch} />
        <p className="text-sm text-muted-foreground whitespace-nowrap">
          {isSearching ? (
            <span className="flex items-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin" />
              Searching…
            </span>
          ) : (
            `${memes.length} meme${memes.length !== 1 ? "s" : ""}`
          )}
        </p>
      </div>

      {memes.length === 0 && !isSearching ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg font-medium">No memes found</p>
          <p className="text-sm mt-1">Try a different search term</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {memes.map((meme) => (
              <MemeCard key={meme.id} meme={meme} />
            ))}
          </div>

          {nextCursor && (
            <div className="flex justify-center pt-2">
              <Button
                variant="outline"
                onClick={handleLoadMore}
                disabled={isLoadingMore}
              >
                {isLoadingMore ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Loading…
                  </>
                ) : (
                  "Load More"
                )}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
