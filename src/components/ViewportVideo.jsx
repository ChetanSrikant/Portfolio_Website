import { useEffect, useRef, useState } from 'react';

export default function ViewportVideo({ src, autoPlay = false, ...props }) {
  const ref = useRef(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const video = ref.current;
    let visible = false;
    const update = () => {
      if (visible && !document.hidden && autoPlay) video.play().catch(() => {});
      else video.pause();
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) setReady(true);
      update();
    }, { rootMargin: '100px' });
    observer.observe(video);
    video.addEventListener('loadeddata', update);
    document.addEventListener('visibilitychange', update);
    return () => {
      observer.disconnect();
      video.removeEventListener('loadeddata', update);
      document.removeEventListener('visibilitychange', update);
      video.pause();
    };
  }, [autoPlay]);
  return <video ref={ref} {...props} src={ready ? src : undefined} preload={ready ? 'metadata' : 'none'} />;
}
