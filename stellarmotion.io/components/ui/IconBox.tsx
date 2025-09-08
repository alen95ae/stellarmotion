import Image from "next/image";

export function IconBox({ src, alt }: { src: string; alt: string }) {
  return (
    <span className="inline-flex items-center justify-center w-7 h-7 rounded-md border bg-white shrink-0">
      <Image src={src} alt={alt} width={20} height={20} />
    </span>
  );
}
