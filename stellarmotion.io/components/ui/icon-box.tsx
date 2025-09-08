import Image from 'next/image';

interface IconBoxProps {
  src: string;
  alt: string;
  className?: string;
}

export function IconBox({ src, alt, className = "" }: IconBoxProps) {
  return (
    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-md bg-white border border-gray-200 ${className}`}>
      <Image 
        src={src} 
        alt={alt} 
        width={20} 
        height={20}
        className="object-contain"
      />
    </span>
  );
}
