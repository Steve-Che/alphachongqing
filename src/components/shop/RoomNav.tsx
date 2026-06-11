import Link from "next/link";
import { ROOM_LABELS } from "@/lib/chongqing/geo";
import { roomTypeToSlug } from "@/lib/rooms";
import { shopPath } from "@/lib/route-slug";

type Room = {
  id: string;
  roomType: string;
  displayName: string;
};

export function RoomNav({
  shopSlug,
  rooms,
  activeRoomType,
}: {
  shopSlug: string;
  rooms: Room[];
  activeRoomType?: string;
}) {
  return (
    <nav className="flex flex-wrap gap-2 border-b border-stone-200 pb-4">
      <Link
        href={shopPath(shopSlug)}
        className={`rounded px-3 py-1.5 text-sm ${
          !activeRoomType
            ? "bg-stone-800 text-white"
            : "bg-stone-100 text-stone-700 hover:bg-stone-200"
        }`}
      >
        店面
      </Link>
      {rooms.map((room) => (
        <Link
          key={room.id}
          href={shopPath(shopSlug, roomTypeToSlug(room.roomType))}
          className={`rounded px-3 py-1.5 text-sm ${
            activeRoomType === room.roomType
              ? "bg-stone-800 text-white"
              : "bg-stone-100 text-stone-700 hover:bg-stone-200"
          }`}
        >
          {room.displayName || ROOM_LABELS[room.roomType]}
        </Link>
      ))}
    </nav>
  );
}
