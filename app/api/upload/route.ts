import { NextResponse } from "next/server";
import { requireEditor } from "@/lib/permissions";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    await requireEditor();
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg === "UNAUTHORIZED") {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }
    if (msg === "FORBIDDEN") {
      return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
    }
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = form.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json(
      { error: "Only image files are allowed" },
      { status: 400 },
    );
  }
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json(
      { error: "File exceeds the 5 MB size limit" },
      { status: 400 },
    );
  }

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import("@vercel/blob");
    const blob = await put(
      `wiki/${crypto.randomUUID()}-${file.name}`,
      file,
      { access: "public" },
    );
    return NextResponse.json({ url: blob.url });
  }

  // Dev fallback: write to public/uploads/
  const { mkdir, writeFile } = await import("fs/promises");
  const { join, extname } = await import("path");

  const rawExt = extname(file.name).replace(".", "").toLowerCase();
  const ext = rawExt || file.type.split("/")[1] || "bin";
  const name = `${crypto.randomUUID()}.${ext}`;
  const dir = join(process.cwd(), "public", "uploads");

  await mkdir(dir, { recursive: true });
  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(join(dir, name), bytes);

  return NextResponse.json({ url: `/uploads/${name}` });
}
