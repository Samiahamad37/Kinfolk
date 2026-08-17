import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SettingsForm } from "@/components/SettingsForm";

export default async function SettingsPage() {
  const user = await requireUser();

  const settings = await prisma.userSettings.upsert({
    where: { userId: user.id },
    create: { userId: user.id },
    update: {},
  });

  return (
    <SettingsForm
      userName={user.name}
      settings={{
        theme: settings.theme,
        language: settings.language,
        notifyBirthdays: settings.notifyBirthdays,
        notifyAnniversaries: settings.notifyAnniversaries,
        notifyStories: settings.notifyStories,
        notifyMessages: settings.notifyMessages,
        profilePrivacy: settings.profilePrivacy,
        treePrivacy: settings.treePrivacy,
        photosPrivacy: settings.photosPrivacy,
        documentsPrivacy: settings.documentsPrivacy,
        storiesPrivacy: settings.storiesPrivacy,
      }}
    />
  );
}
