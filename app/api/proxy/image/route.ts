export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get("url")

  if (!url) {
    return new Response("Missing url parameter", { status: 400 })
  }

  // SSRF protection: only allow i.imgflip.com
  let parsedUrl: URL
  try {
    parsedUrl = new URL(url)
  } catch {
    return new Response("Invalid URL", { status: 400 })
  }

  if (parsedUrl.hostname !== "i.imgflip.com") {
    return new Response("Only i.imgflip.com is allowed", { status: 403 })
  }

  try {
    const imageRes = await fetch(url)
    if (!imageRes.ok) {
      return new Response("Failed to fetch image", { status: imageRes.status })
    }

    const contentType = imageRes.headers.get("content-type") ?? "image/jpeg"
    const buffer = await imageRes.arrayBuffer()

    return new Response(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400",
        "Access-Control-Allow-Origin": "*",
      },
    })
  } catch {
    return new Response("Error fetching image", { status: 500 })
  }
}
