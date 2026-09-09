import { forwardRef } from 'react';
import media from '../config/media-delivery.json';

const ResponsiveImage = forwardRef(function ResponsiveImage({ src, srcSet, sizes = '(max-width: 720px) 100vw, 960px', ...props }, ref) {
  const delivery = media[src];
  return <img ref={ref} {...props} src={delivery?.src || src} srcSet={srcSet || delivery?.srcSet} sizes={delivery ? sizes : undefined} />;
});

export default ResponsiveImage;
