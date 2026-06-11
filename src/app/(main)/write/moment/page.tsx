import { auth } from "@/lib/auth";
import { getAllStreetsForSelect, getUserResidence } from "@/lib/queries";
import { MomentComposer } from "@/components/feed/MomentComposer";

export default async function WriteMomentPage() {
  const session = await auth();
  const residence = session?.user?.id
    ? await getUserResidence(session.user.id)
    : null;

  const defaultStreetId =
    residence?.shop?.shopSlot.street.id ??
    residence?.apartmentUnit?.building.street.id;
  const defaultStreetName =
    residence?.shop?.shopSlot.street.nameZh ??
    residence?.apartmentUnit?.building.street.nameZh;

  const streets = await getAllStreetsForSelect();

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <header>
        <h1 className="font-serif text-2xl font-semibold">发短文</h1>
        <p className="mt-1 text-sm text-stone-500">
          像早期的微博——几句话，配几张图，不必短视频。
          {defaultStreetName && ` 默认发布到你所住的 ${defaultStreetName}。`}
        </p>
      </header>
      <MomentComposer
        defaultStreetId={defaultStreetId}
        defaultStreetName={defaultStreetName}
        streets={streets}
      />
    </div>
  );
}
