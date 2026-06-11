import Image from "next/image";

const BLOB_HOST = "public.blob.vercel-storage.com";

function isOptimizable(src: string) {
  try {
    const url = new URL(src);
    return url.hostname.endsWith(BLOB_HOST);
  } catch {
    return false;
  }
}

export function PostImage({
  src,
  alt,
  className,
  width = 400,
  height = 300,
}: {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
}) {
  if (isOptimizable(src)) {
    return (
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
        unoptimized={false}
      />
    );
  }
  return <img src={src} alt={alt} className={className} />;
}
