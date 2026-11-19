import { motion } from "framer-motion";
import { Reveal } from "./primitives";

const technologies = [
  "USP Фармакопея",
  "100% Чистота сырья",
  "0% Диацетила",
  "GC/MS Хроматография",
  "PG / VG 100% Совместимость",
  "Термостабильность 280°C",
  "Сертификаты EAC / MSDS",
  "Асептический розлив",
];

const capabilities = [
  {
    title: "Контрактное производство",
    body: "Полный цикл создания индивидуальных линеек под вашим брендом (White Label): от подбора рецептур до фасовки и маркировки.",
  },
  {
    title: "Оптовые поставки сырья",
    body: "Прямые поставки сертифицированных концентратов ароматизаторов в промышленной таре (1 л, 5 л, 25 л) для крупных производств.",
  },
  {
    title: "Готовые шоты & моно-аромы",
    body: "Фасованная продукция в эргономичных флаконах 10 мл и 30 мл с контролем первого вскрытия для розничных полок и дистрибуции.",
  },
  {
    title: "R&D Лаборатория вкуса",
    body: "Разработка авторских многоуровневых вкусовых пирамид, адаптация мировых бестселлеров и точечная калибровка сладости и холодка.",
  },
];

export function Tools() {
  return (
    <section id="tech" className="bg-light-panel py-24 text-foreground md:py-32 border-y border-border">
      <div className="container-midu">
        <Reveal>
          <h2 className="text-3xl leading-tight font-semibold tracking-tight sm:text-4xl md:text-[2.75rem]">
            Чистые технологии &amp;
          </h2>
        </Reveal>

        <Reveal delay={0.05}>
          <div className="my-6 flex flex-wrap items-center gap-2">
            {technologies.map((t) => (
              <motion.span
                key={t}
                whileHover={{ y: -3 }}
                className="rounded-xl border border-purple-200/80 bg-white px-3.5 py-2 font-mono text-xs font-medium text-foreground shadow-[0_2px_0_0_rgba(93,0,255,0.08)] transition-colors hover:border-[#5D00FF]/50 hover:text-[#5D00FF] dark:bg-[#121218] dark:border-white/10 dark:text-white dark:hover:border-purple-400"
              >
                {t}
              </motion.span>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          <h2 className="text-3xl leading-tight font-semibold tracking-tight sm:text-4xl md:text-[2.75rem]">
            безупречный вкус вашего продукта.
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {capabilities.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.06}>
              <motion.div
                whileHover={{ y: -5 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="flex h-full flex-col justify-between rounded-3xl border border-border bg-white p-7 shadow-xs transition-all hover:border-border-strong hover:shadow-md dark:bg-[#0c0c10] dark:border-white/10"
              >
                <div>
                  <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#5D00FF]">
                    Направление 0{i + 1}
                  </span>
                  <h3 className="mt-3 text-xl font-semibold tracking-tight text-foreground">
                    {s.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {s.body}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-border">
                  <a
                    href="#contact"
                    className="inline-flex items-center text-xs font-semibold text-[#5D00FF] hover:text-[#4C00D4] transition-colors"
                  >
                    Запросить спецификацию →
                  </a>
                </div>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
