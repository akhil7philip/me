interface TagProps {
  children: React.ReactNode;
  variant?: 'default' | 'featured';
}

export function Tag({ children, variant = 'default' }: TagProps) {
  if (variant === 'featured') {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-pill text-xs font-medium bg-accent-amber text-bg-primary">
        {children}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-3 py-1 rounded-pill text-xs font-medium bg-[rgba(212,165,116,0.08)] border border-[rgba(212,165,116,0.15)] text-accent-amber">
      {children}
    </span>
  );
}
