import { flagDataUrl, flagFallbackUrl, nationName } from '../game/flags';

interface FlagProps {
  index: number;
  alt?: string;
  className?: string;
  title?: string;
}

export function Flag({ index, alt, className, title }: FlagProps) {
  return (
    <img
      className={className}
      src={flagDataUrl(index)}
      alt={alt ?? nationName(index)}
      title={title}
      loading="lazy"
      draggable={false}
      onError={(event) => {
        const img = event.currentTarget;
        if (img.dataset.fallback === '1') return;
        img.dataset.fallback = '1';
        img.src = flagFallbackUrl(index);
      }}
    />
  );
}
