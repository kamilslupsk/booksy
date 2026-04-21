import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { put, del } from "@vercel/blob";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.providerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await req.formData();
  const file = form.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "Brak pliku" }, { status: 400 });

  if (!file.type.startsWith("image/")) return NextResponse.json({ error: "Tylko obrazy" }, { status: 400 });
  if (file.size > 5 * 1024 * 1024) return NextResponse.json({ error: "Maks. 5 MB" }, { status: 400 });

  const provider = await prisma.provider.findUnique({
    where: { id: session.user.providerId },
    select: { galleryImages: true },
  });
  if (!provider) return NextResponse.json({ error: "Nie znaleziono" }, { status: 404 });
  if (provider.galleryImages.length >= 20) return NextResponse.json({ error: "Maks. 20 zdjęć" }, { status: 400 });

  const ext = file.name.split(".").pop() ?? "jpg";
  const blob = await put(`gallery/${session.user.providerId}/${Date.now()}.${ext}`, file, {
    access: "public",
    contentType: file.type,
  });

  await prisma.provider.update({
    where: { id: session.user.providerId },
    data: { galleryImages: { push: blob.url } },
  });

  return NextResponse.json({ url: blob.url });
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.providerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { url } = await req.json();
  if (!url) return NextResponse.json({ error: "Brak URL" }, { status: 400 });

  const provider = await prisma.provider.findUnique({
    where: { id: session.user.providerId },
    select: { galleryImages: true },
  });
  if (!provider?.galleryImages.includes(url)) {
    return NextResponse.json({ error: "Brak dostępu" }, { status: 403 });
  }

  await del(url);
  await prisma.provider.update({
    where: { id: session.user.providerId },
    data: { galleryImages: provider.galleryImages.filter((u) => u !== url) },
  });

  return NextResponse.json({ ok: true });
}
