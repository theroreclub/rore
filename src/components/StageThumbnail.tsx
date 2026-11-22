import Image from "next/image";

export function StageThumbnail({ src, size }: { src: string; size: number }) {
  return (
    <div className="rc-product-stage stage-thumbnail" style={{ width: size }}>
      <Image src={src} alt="" width={size} height={size} unoptimized />
    </div>
  );
}
