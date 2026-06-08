import { NextResponse } from "next/server";
import { put } from "@vercel/blob";

const MAX_BYTES = 1_500_000;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function POST(request: Request) {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Image upload is not configured. Paste an image URL instead, or set BLOB_READ_WRITE_TOKEN on Vercel.",
      },
      { status: 503 },
    );
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ ok: false, error: "Expected multipart form data." }, { status: 400 });
  }

  const ensName = String(form.get("ensName") ?? "");
  const file = form.get("file");
  if (!ensName.includes(".") || !(file instanceof File)) {
    return NextResponse.json({ ok: false, error: "ensName and file are required." }, { status: 400 });
  }

  if (!ALLOWED.has(file.type)) {
    return NextResponse.json({ ok: false, error: "Use JPEG, PNG, or WebP." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ ok: false, error: "Image must be under 1.5 MB." }, { status: 400 });
  }

  const safe = ensName.toLowerCase().replace(/[^a-z0-9.-]/g, "");
  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const pathname = `avatars/${safe}/avatar.${ext}`;

  try {
    const blob = await put(pathname, file, {
      access: "public",
      token,
      addRandomSuffix: true,
      contentType: file.type,
    });
    return NextResponse.json({ ok: true, url: blob.url });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Upload failed." },
      { status: 500 },
    );
  }
}
