import { auth } from "@clerk/nextjs/server"
import Replicate from "replicate"

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const imageBase64 = body.imageBase64 as string | undefined

  if (!imageBase64) {
    return Response.json({ error: "imageBase64 is required" }, { status: 400 })
  }

  const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN ?? "",
  })

  const ocrPromise = (replicate.run("andreasjansson/blip-2:f677695e5e89f8b236e52ecd1d3f01beb44c34606419bcc19345e046d8f786f9", {
    input: { image: imageBase64, question: "Describe this image in detail for meme context." },
  }) as Promise<unknown>).then((r) => (typeof r === "string" ? r : String(r)))

  const timeoutPromise = new Promise<string>((resolve) =>
    setTimeout(() => resolve(""), 15000)
  )

  try {
    const description = await Promise.race([ocrPromise, timeoutPromise])
    return Response.json({ description: typeof description === "string" ? description : "" })
  } catch (err) {
    const message = err instanceof Error ? err.message : "OCR failed"
    console.error("OCR error:", message)
    return Response.json({ description: "" })
  }
}
