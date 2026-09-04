import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DocumentsBrowser } from "@/components/DocumentsBrowser";

export default async function DocumentsPage() {
  const user = await requireUser();

  const documents = await prisma.familyDocument.findMany({
    where: { ownerId: user.accountOwnerId },
    include: { people: { include: { person: true } } },
    orderBy: { createdAt: "desc" },
  });

  return <DocumentsBrowser documents={documents} />;
}
