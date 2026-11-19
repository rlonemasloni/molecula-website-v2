import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";

const menuItems = [
  {
    label: "Главная",
    href: "#top",
    color: "#5D00FF",
  },
  {
    label: "Коллекции вкусов",
    href: "#flavors",
    color: "#0284C7",
  },
  {
    label: "Вопросы и ответы",
    href: "#faq",
    color: "#BE185D",
  },
  {
    label: "Связаться с нами",
    href: "#contact",
    color: "#77B80F",
  },
];

export function Nav() {
  const [isOpen, setIsOpen] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("molecula-theme");
      if (saved === "light" || saved === "dark") return saved;
      return "dark"; // Default to dark as requested
    }
    return "dark";
  });

  // Automatically close header when scrolling down
  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY + 4) {
        setIsOpen(false);
      }
      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close when tapping outside on mobile
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      const navEl = document.getElementById("main-nav-pill");
      if (navEl && !navEl.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("pointerdown", handleClickOutside);
    return () => document.removeEventListener("pointerdown", handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
      localStorage.setItem("molecula-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("molecula-theme", "light");
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <header className="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-4 sm:top-5">
      <motion.div
        id="main-nav-pill"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        initial={{ opacity: 0, y: -14 }}
        animate={{
          opacity: 1,
          y: 0,
          width: isOpen ? 340 : 120,
          borderRadius: isOpen ? 22 : 18,
        }}
        transition={{
          duration: 0.4,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="pointer-events-auto max-w-[calc(100vw-2rem)] overflow-hidden border border-white/10 bg-[#111113]/96 text-white shadow-[0_24px_60px_-12px_rgba(14,9,28,0.45)] backdrop-blur-2xl"
      >
        {/* Top bar of the pill */}
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className={`flex w-full cursor-pointer items-center py-3.5 text-left transition-all ${
            isOpen ? "justify-between px-5" : "justify-center px-4"
          }`}
        >
          <span className="flex items-center gap-2.5">
            {/* 2x2 grid icon */}
            <span
              className={`grid grid-cols-2 gap-[3px] transition-transform duration-300 ${
                isOpen ? "rotate-45" : "rotate-0"
              }`}
            >
              <span className="size-[4.5px] rounded-[1px] bg-white" />
              <span className="size-[4.5px] rounded-[1px] bg-white" />
              <span className="size-[4.5px] rounded-[1px] bg-white" />
              <span className="size-[4.5px] rounded-[1px] bg-white" />
            </span>

            <span className="text-[15px] font-medium tracking-tight text-white">
              {isOpen ? "Molecula" : "Menu"}
            </span>
          </span>
        </button>

        {/* Expandable body on hover */}
        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              key="nav-dropdown"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <nav className="flex flex-col">
                {menuItems.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className="group flex items-center justify-between border-t border-white/10 px-5 py-3.5 transition-colors hover:bg-white/[0.04]"
                  >
                    <span className="text-[17px] font-medium tracking-tight text-white transition-transform duration-300 group-hover:translate-x-1">
                      {item.label}
                    </span>

                    {/* Colored rounded square instead of preview image */}
                    <span
                      className="size-6 rounded-lg shrink-0 border border-white/20 shadow-sm transition-transform duration-300 group-hover:scale-110"
                      style={{ backgroundColor: item.color }}
                    />
                  </a>
                ))}
              </nav>

              {/* Centered Apple-style iOS Theme Toggle Switch */}
              <div className="border-t border-white/10 bg-white/[0.03] px-5 py-4 flex items-center justify-center gap-3.5">
                <Sun
                  className={`size-4 transition-colors duration-200 ${
                    theme === "light" ? "text-amber-400" : "text-white/35"
                  }`}
                />

                <button
                  type="button"
                  role="switch"
                  aria-checked={theme === "dark"}
                  aria-label="Переключить тему оформления"
                  onClick={toggleTheme}
                  className={`relative inline-flex h-[30px] w-[50px] shrink-0 cursor-pointer rounded-full p-[2px] transition-colors duration-300 ease-in-out focus:outline-none ${
                    theme === "dark" ? "bg-[#5D00FF]" : "bg-white/30"
                  }`}
                >
                  <span className="sr-only">Переключить тему</span>
                  <span
                    className={`pointer-events-none inline-block size-[26px] rounded-full bg-white shadow-[0_2px_4px_rgba(0,0,0,0.3)] transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                      theme === "dark" ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>

                <Moon
                  className={`size-4 transition-colors duration-200 ${
                    theme === "dark" ? "text-purple-300" : "text-white/35"
                  }`}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </header>
  );
}
export default Nav;
