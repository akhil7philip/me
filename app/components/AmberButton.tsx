import Link from 'next/link';

interface AmberButtonProps {
  children: React.ReactNode;
  href?: string;
  variant?: 'solid' | 'ghost';
  onClick?: () => void;
  type?: 'button' | 'submit';
}

export function AmberButton({
  children,
  href,
  variant = 'solid',
  onClick,
  type = 'button',
}: AmberButtonProps) {
  const baseClasses =
    'inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-pill font-body font-medium transition-all duration-300';

  const solidClasses =
    'bg-accent-amber text-bg-primary shadow-[0_0_20px_rgba(212,165,116,0.3)] hover:bg-accent-amber-bright hover:shadow-[0_0_30px_rgba(212,165,116,0.5)] hover:-translate-y-0.5';

  const ghostClasses =
    'bg-transparent border border-accent-amber text-accent-amber hover:bg-[rgba(212,165,116,0.1)] hover:shadow-[0_0_20px_rgba(212,165,116,0.2)] hover:-translate-y-0.5';

  const classes = `${baseClasses} ${variant === 'solid' ? solidClasses : ghostClasses}`;

  if (href) {
    if (href.startsWith('http') || href.startsWith('mailto:')) {
      return (
        <a href={href} className={classes} target="_blank" rel="noopener noreferrer">
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} className={classes}>
      {children}
    </button>
  );
}
