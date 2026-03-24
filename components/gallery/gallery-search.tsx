"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

interface GallerySearchProps {
  onSearch: (query: string) => void
}

export function GallerySearch({ onSearch }: GallerySearchProps) {
  const [value, setValue] = useState("")
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value
      setValue(v)
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => onSearch(v), 200)
    },
    [onSearch]
  )

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current) }, [])

  return (
    <div className="relative max-w-md w-full">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      <Input
        type="search"
        placeholder="Search memes..."
        value={value}
        onChange={handleChange}
        className="pl-9 bg-card border-border"
      />
    </div>
  )
}
