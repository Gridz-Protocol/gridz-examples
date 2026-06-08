import { NextResponse } from "next/server";
import { pinataConfigured, uploadToPinata } from "../../../../lib/pinataUpload";

const MAX_BYTES = 1_500_000;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function POST(request: Request) {
  if (!pinataConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Image upload is not configured. Set PINATA_JWT or PINATA_API_KEY + PINATA_API_SECRET on the server, or paste an image URL.",
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

  try {
    const { cid, url } = await uploadToPinata(file, {
      name: `gridz-avatar-${safe}`,
      ensName,
    });
    return NextResponse.json({ ok: true, url, cid });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Upload failed." },
      { status: 500 },
    );
  }
}
