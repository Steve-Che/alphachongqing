import Link from "next/link";
import { ROOM_LABELS } from "@/lib/chongqing/geo";
import { roomTypeToSlug } from "@/lib/rooms";

type Room = {
  id: string;
  roomType: string;
  displayName: string;
  _count?: { roomContents: number };
  roomContents?: { id: string }[];
};

export function RoomFloorPlan({
  shopSlug,
  rooms,
  activeRoomType,
}: {
  shopSlug: string;
  rooms: Room[];
  activeRoomType?: string;
}) {
  const layout: { type: string; grid: string }[] = [
    { type: "FRONT_HALL", grid: "col-span-2" },
    { type: "LEFT_WING", grid: "" },
    { type: "RIGHT_WING", grid: "" },
    { type: "MAIN_HALL", grid: "col-span-2" },
    { type: "BACK_GARDEN", grid: "col-span-2" },
    { type: "SIDE_ROOM", grid: "col-span-2" },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 rounded-lg border border-stone-200 bg-stone-50 p-4">
      {layout.map(({ type, grid }) => {
        const room = rooms.find((r) => r.roomType === type);
        if (!room) return null;
        const active = activeRoomType === type;
        const hasContent =
          (room._count?.roomContents ?? room.roomContents?.length ?? 0) > 0;
        const slug = roomTypeToSlug(type);

        return (
          <Link
            key={type}
            href={`/shop/${shopSlug}/${slug}`}
            className={`rounded border p-3 text-sm transition-colors ${grid} ${
              active
                ? "border-stone-800 bg-stone-800 text-white"
                : "border-stone-200 bg-paper hover:border-accent"
            }`}
          >
            <span className="font-medium">{room.displayName}</span>
            <span className={`mt-1 block text-xs ${active ? "text-stone-300" : "text-stone-400"}`}>
              {ROOM_LABELS[type]}
              {hasContent ? " · 有内容" : " · 空置"}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
