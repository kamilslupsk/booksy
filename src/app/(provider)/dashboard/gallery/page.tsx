import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { GalleryManager } from "@/components/provider/GalleryManager";

export default async function GalleryPage() {
  const session = await auth();
  if (!session?.user?.providerId) redirect("/login");

  const provider = await prisma.provider.findUnique({
    where: { id: session.user.providerId },
    select: { galleryImages: true },
  });

  return (
    <div className="p-6 md:p-10 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Galeria</h1>
        <p className="text-sm text-slate-500 mt-1">
          Dodaj zdjęcia swojej pracy. Maks. 20 zdjęć · do 5 MB każde.
        </p>
      </div>
      <GalleryManager initialImages={provider?.galleryImages ?? []} />
    </div>
  );
}
