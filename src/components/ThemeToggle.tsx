import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";

export function ThemeToggle() {
  const { isDark, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      aria-label="تبديل الوضع الليلي"
      className="fixed top-5 left-5 z-50 h-12 w-12 rounded-full bg-card border border-border shadow-lg flex items-center justify-center text-primary hover:scale-110 hover:rotate-180 transition-all duration-500"
    >
      {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  );
}