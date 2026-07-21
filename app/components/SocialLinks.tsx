import { Github, Twitter, Linkedin } from 'lucide-react';

interface SocialLinksProps {
  className?: string;
  iconSize?: number;
}

const socials = [
  { name: 'GitHub', href: 'https://github.com/akhil7philip', Icon: Github },
  { name: 'X (Twitter)', href: 'https://x.com/akhil7philip', Icon: Twitter },
  { name: 'LinkedIn', href: 'https://linkedin.com/in/akhilphilip/', Icon: Linkedin },
];

export function SocialLinks({ className = '', iconSize = 18 }: SocialLinksProps) {
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {socials.map(({ name, href, Icon }) => (
        <a
          key={name}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={name}
          className="w-11 h-11 rounded-full border border-border-subtle bg-transparent flex items-center justify-center text-text-secondary transition-all duration-300 hover:border-accent-amber hover:text-accent-amber hover:shadow-[0_0_12px_rgba(212,165,116,0.2)]"
        >
          <Icon size={iconSize} />
        </a>
      ))}
    </div>
  );
}
