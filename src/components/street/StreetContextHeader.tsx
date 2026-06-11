type StreetContextHeaderProps = {
  streetName: string;
  serviceChief?: {
    username: string;
    displayName: string | null;
  } | null;
};

export function StreetContextHeader({
  streetName,
  serviceChief,
}: StreetContextHeaderProps) {
  const chiefName = serviceChief
    ? serviceChief.displayName ?? serviceChief.username
    : null;

  return (
    <div className="text-center">
      <h1 className="font-serif text-2xl font-semibold tracking-wide text-stone-900 sm:text-3xl">
        {streetName}
      </h1>
      <p className="mt-1 text-sm text-stone-600">
        {chiefName ? (
          <>
            现任街道服务长：
            <span className="font-medium text-[#b84a2f]">{chiefName}</span>
          </>
        ) : (
          <span className="text-stone-400">街道服务长虚位以待</span>
        )}
      </p>
    </div>
  );
}
