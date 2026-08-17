import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { StoriesBrowser } from "@/components/StoriesBrowser";

export default async function StoriesPage() {
  const user = await requireUser();

  const stories = await prisma.story.findMany({
    where: { ownerId: user.id },
    include: { author: true },
    orderBy: { createdAt: "desc" },
  });

  return <StoriesBrowser stories={stories} />;
}
