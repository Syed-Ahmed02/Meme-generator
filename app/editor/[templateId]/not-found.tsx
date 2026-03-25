import Link from "next/link"
import { Laugh, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function EditorNotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4 bg-background">
      <div className="p-4 rounded-full bg-muted">
        <Laugh className="h-8 w-8 text-muted-foreground" />
      </div>
      <div className="text-center">
        <h1 className="text-xl font-bold">Meme not found</h1>
        <p className="text-sm text-muted-foreground mt-1">
          That template doesn&apos;t exist or has been removed.
        </p>
      </div>
      <Link href="/">
        <Button className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Gallery
        </Button>
      </Link>
    </div>
  )
}
