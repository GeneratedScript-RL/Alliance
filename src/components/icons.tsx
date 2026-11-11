import type { SVGProps } from 'react';

type Props = SVGProps<SVGSVGElement>;

function Svg({ children, ...rest }: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  );
}

export const IconAttack = (p: Props) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="6.5" />
    <path d="M12 2.5v3.5M12 18v3.5M2.5 12H6M18 12h3.5" />
    <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
  </Svg>
);

export const IconTransfer = (p: Props) => (
  <Svg {...p}>
    <path d="M4 9h14l-3.2-3.2M20 15H6l3.2 3.2" />
  </Svg>
);

export const IconHeal = (p: Props) => (
  <Svg {...p}>
    <path d="M12 20s-7-4.4-7-9a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 4.6-7 9-7 9Z" />
  </Svg>
);

export const IconRange = (p: Props) => (
  <Svg {...p}>
    <path d="M20 4 11 13" />
    <path d="M14 4h6v6" />
    <circle cx="8.5" cy="15.5" r="3.5" />
  </Svg>
);

export const IconPlus = (p: Props) => (
  <Svg {...p}>
    <path d="M12 5v14M5 12h14" />
  </Svg>
);

export const IconMinus = (p: Props) => (
  <Svg {...p}>
    <path d="M5 12h14" />
  </Svg>
);

export const IconFlag = (p: Props) => (
  <Svg {...p}>
    <path d="M6 21V4" />
    <path d="M6 4h11l-2.2 4L17 12H6" />
  </Svg>
);

export const IconTrash = (p: Props) => (
  <Svg {...p}>
    <path d="M4 7h16M9.5 7V4h5v3M6.5 7l1 13h9l1-13" />
    <path d="M10 11v5.5M14 11v5.5" />
  </Svg>
);

export const IconUndo = (p: Props) => (
  <Svg {...p}>
    <path d="M4.5 10.5h9.5a5 5 0 0 1 0 10H9" />
    <path d="M8.5 6 4 10.5l4.5 4.5" />
  </Svg>
);

export const IconRedo = (p: Props) => (
  <Svg {...p}>
    <path d="M19.5 10.5H10a5 5 0 0 0 0 10h5" />
    <path d="M15.5 6 20 10.5 15.5 15" />
  </Svg>
);

export const IconSave = (p: Props) => (
  <Svg {...p}>
    <path d="M12 3v10.5" />
    <path d="m8 10 4 4 4-4" />
    <path d="M4.5 16.5V19a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-2.5" />
  </Svg>
);

export const IconHome = (p: Props) => (
  <Svg {...p}>
    <path d="M4 11 12 4l8 7" />
    <path d="M6.5 9.8V20h11V9.8" />
  </Svg>
);

export const IconHelp = (p: Props) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M9.7 9.6a2.5 2.5 0 1 1 3.4 2.4c-.7.3-1.1.9-1.1 1.6v.4" />
    <circle cx="12" cy="17" r="1" fill="currentColor" stroke="none" />
  </Svg>
);

export const IconTurn = (p: Props) => (
  <Svg {...p}>
    <path d="M20 12a8 8 0 1 1-2.7-6" />
    <path d="M20 4.5V10h-5.5" />
  </Svg>
);

export const IconClose = (p: Props) => (
  <Svg {...p}>
    <path d="m6 6 12 12M18 6 6 18" />
  </Svg>
);

export const IconChevronRight = (p: Props) => (
  <Svg {...p}>
    <path d="m9.5 6 6 6-6 6" />
  </Svg>
);

export const IconMove = (p: Props) => (
  <Svg {...p}>
    <path d="M4 12h13" />
    <path d="m12.5 7.5 5 4.5-5 4.5" />
  </Svg>
);

export const IconStar = (p: Props) => (
  <Svg {...p}>
    <path d="m12 4 2.4 5.2 5.6.7-4.1 3.9 1 5.6-4.9-2.7-4.9 2.7 1-5.6L4 9.9l5.6-.7z" />
  </Svg>
);
