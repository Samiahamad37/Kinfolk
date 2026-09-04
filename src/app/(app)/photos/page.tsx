import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PhotosBrowser } from "@/components/PhotosBrowser";

export default async function PhotosPage() {
  const user = await requireUser();

  const [albums, photos] = await Promise.all([
    prisma.album.findMany({
      where: { ownerId: user.accountOwnerId },
      include: { _count: { select: { photos: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.photo.findMany({
      where: { ownerId: user.accountOwnerId },
      include: { people: { include: { person: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return <PhotosBrowser albums={albums} photos={photos} />;
}
