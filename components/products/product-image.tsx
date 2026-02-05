import { ShoppingBag } from "lucide-react";

interface ProductImageProps {
  src: string | null;
  alt: string;
  className?: string;
}

export function ProductImage({ src, alt, className = "" }: ProductImageProps) {
  if (!src) {
    return (
      <div className={`flex items-center justify-center bg-muted/50 ${className}`}>
        <ShoppingBag className="h-24 w-24 text-muted-foreground" />
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      className={`object-cover ${className}`}
    />
  );
}
