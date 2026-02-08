import React from "react";

type LoadingAttr = "eager" | "lazy";
type DecodingAttr = "async" | "auto" | "sync";

interface ResponsiveImageProps {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  loading?: LoadingAttr;
  decoding?: DecodingAttr;
  fetchPriority?: "high" | "low" | "auto";
  width?: number;
  height?: number;
}

const isJpeg = (src: string) => /\.(jpe?g)$/i.test(src);

const toWebpSrcSet = (src: string) => {
  const base = src.replace(/\.(jpe?g)$/i, "");
  return `${base}-640.webp 640w, ${base}-1200.webp 1200w`;
};

const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  src,
  alt,
  className,
  sizes = "100vw",
  loading = "lazy",
  decoding = "async",
  fetchPriority,
  width,
  height,
}) => {
  if (!isJpeg(src)) {
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        loading={loading}
        decoding={decoding}
        fetchPriority={fetchPriority}
        width={width}
        height={height}
      />
    );
  }

  return (
    <picture>
      <source type="image/webp" srcSet={toWebpSrcSet(src)} sizes={sizes} />
      <img
        src={src}
        alt={alt}
        className={className}
        loading={loading}
        decoding={decoding}
        fetchPriority={fetchPriority}
        width={width}
        height={height}
      />
    </picture>
  );
};

export default ResponsiveImage;
