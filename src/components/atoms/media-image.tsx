import Image, { type ImageProps } from 'next/image';

type MediaImageProps = Omit<ImageProps, 'width' | 'height'> & { variant: 'poster' | 'title' };

/** Shared image dimensions and loading defaults, independent of the data source. */
export function MediaImage({ variant, alt, ...props }: MediaImageProps) {
  return variant === 'poster'
    ? <Image alt={alt} width={500} height={750} sizes="220px" {...props} />
    : <Image alt={alt} width={156} height={60} unoptimized loading="eager" {...props} />;
}
