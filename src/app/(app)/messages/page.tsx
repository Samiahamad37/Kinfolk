import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MessagesBrowser } from "@/components/MessagesBrowser";

export default async function MessagesPage() {
  const user = await requireUser();

  const messages = await prisma.message.findMany({
    where: { ownerId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <MessagesBrowser
      defaultSender={user.name}
      messages={messages.map((m) => ({
        id: m.id,
        senderName: m.senderName,
        body: m.body,
        createdAt: m.createdAt.toISOString(),
      }))}
    />
  );
}
