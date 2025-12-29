"use client";

import { usePathname, useRouter } from "next/navigation";
import { useMemo, useCallback } from "react";
import { User, BookOpen, Gamepad2, Quote } from "lucide-react";

type Section = "about" | "blog" | "quotes" | "games";

const sections = [
  { id: "about" as Section, label: "About", icon: User, path: "/" },
  { id: "blog" as Section, label: "Blog", icon: BookOpen, path: "/articles" },
  { id: "quotes" as Section, label: "Quotes", icon: Quote, path: "/quotes" },
  { id: "games" as Section, label: "Games", icon: Gamepad2, path: "/mini-games" },
] as const;

export function SectionNavigation() {
  const router = useRouter();
  const pathname = usePathname();

  const activeSection = useMemo((): Section => {
    if (pathname?.startsWith("/articles")) return "blog";
    if (pathname?.startsWith("/quotes")) return "quotes";
    if (pathname?.startsWith("/mini-games")) return "games";
    return "about";
  }, [pathname]);

  const handleSectionClick = useCallback((path: string) => {
    router.push(path);
  }, [router]);

  return (
    <div className="fixed left-0 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-4 p-4">
      {sections.map((section) => {
        const isActive = activeSection === section.id;
        return (
          <button
            key={section.id}
            onClick={() => handleSectionClick(section.path)}
            className={`
              relative group
              transition-all duration-500 ease-out
              ${isActive 
                ? 'w-16 h-16 scale-110' 
                : 'w-12 h-12 hover:scale-110 hover:w-14 hover:h-14'
              }
              rounded-full
              ${isActive 
                ? 'bg-primary text-primary-foreground shadow-lg' 
                : 'bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground'
              }
              flex items-center justify-center
              backdrop-blur-sm
              border border-border/50
            `}
            aria-label={`Navigate to ${section.label}`}
          >
            <section.icon className={`
              transition-all duration-300
              ${isActive ? 'w-6 h-6' : 'w-5 h-5'}
            `} />
            {isActive && (
              <span className="absolute left-full ml-3 whitespace-nowrap text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                {section.label}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
