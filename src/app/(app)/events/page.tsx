import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { EventsBrowser } from "@/components/EventsBrowser";

export default async function EventsPage() {
  const user = await requireUser();

  const events = await prisma.familyEvent.findMany({
    where: { ownerId: user.accountOwnerId },
    include: { people: { include: { person: true } } },
    orderBy: [{ year: "desc" }, { month: "desc" }, { createdAt: "desc" }],
  });

  return <EventsBrowser events={events} />;
}
