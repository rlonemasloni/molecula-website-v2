import { MoleculaWordmark } from "./MoleculaWordmark";
import { MoleculaLogo } from "./MoleculaLogo";

const explore = [
  { label: "Главная", href: "#top" },
  { label: "Коллекции вкусов", href: "#flavors" },
  { label: "Вопросы и ответы (FAQ)", href: "#faq" },
  { label: "Связаться с нами", href: "#contact" },
];

const documents = [
  { label: "Декларация ЕАС (ТР ТС)", href: "#" },
  { label: "Паспорта безопасности MSDS", href: "#" },
  { label: "Стандарты USP / EP", href: "#" },
  { label: "Политика конфиденциальности", href: "#" },
];

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-border pt-12 pb-0">
      <div className="container-midu relative">
        <div className="grid gap-10 py-12 sm:grid-cols-3">
          <div>
            <div className="mb-4">
              <MoleculaLogo height={20} />
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Производство высокоочищенных пищевых ароматизаторов премиального стандарта и миксологии. 100% пищевая чистота.
            </p>
            <p className="mt-4 font-mono text-[11px] text-muted-foreground/60">
              © {new Date().getFullYear()} MOLECULA. Все права защищены.
            </p>
          </div>

          <div>
            <p className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
              Навигация
            </p>
            <ul className="mt-4 space-y-2">
              {explore.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
              Документация
            </p>
            <ul className="mt-4 space-y-2">
              {documents.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Monumental wordmark background footer - spans full width of the screen */}
      <div className="relative w-full select-none overflow-hidden mt-6">
        <MoleculaWordmark
          variant="footer"
          className="w-full h-[160px] sm:h-[220px] md:h-[280px] lg:h-[350px] xl:h-[400px]"
        />
      </div>
    </footer>
  );
}
export default Footer;
