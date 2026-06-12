import Link from "next/link";
import { FormattedTime } from "@/components/ui/formatted-time";
import { RsvpButton } from "@/components/public-venues/RsvpButton";

type EventItem = {
  id: string;
  title: string;
  summary: string;
  body: string | null;
  startsAt: Date;
  endsAt: Date | null;
  _count: { rsvps: number };
  rsvps?: { userId: string }[];
  venue?: { slug: string; nameZh: string };
  createdBy?: { username: string; displayName: string | null };
};

export function PublicEventList({
  events,
  isLoggedIn,
  showVenue = false,
}: {
  events: EventItem[];
  isLoggedIn: boolean;
  showVenue?: boolean;
}) {
  if (events.length === 0) {
    return <p className="text-sm text-stone-500">暂无近期活动，敬请关注。</p>;
  }

  return (
    <ul className="space-y-4">
      {events.map((event) => {
        const rsvped = (event.rsvps?.length ?? 0) > 0;
        return (
          <li
            key={event.id}
            className="rounded border border-stone-200 bg-paper p-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-serif font-semibold text-stone-900">
                  {event.title}
                </h3>
                {showVenue && event.venue && (
                  <Link
                    href={`/place/${event.venue.slug}`}
                    className="text-xs text-accent hover:underline"
                  >
                    {event.venue.nameZh}
                  </Link>
                )}
                <p className="mt-1 text-sm text-stone-600">{event.summary}</p>
                {event.body && (
                  <p className="mt-2 text-sm text-stone-500">{event.body}</p>
                )}
                <p className="mt-2 text-xs text-stone-400">
                  <FormattedTime date={event.startsAt} />
                  {event.endsAt && (
                    <>
                      {" "}
                      — <FormattedTime date={event.endsAt} />
                    </>
                  )}
                </p>
                <p className="mt-1 text-xs text-stone-500">
                  {event._count.rsvps} 人已报名
                </p>
              </div>
              <RsvpButton
                eventId={event.id}
                initialRsvped={rsvped}
                isLoggedIn={isLoggedIn}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
