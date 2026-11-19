import { ShieldCheck } from "lucide-react";
import { Reveal, SectionTitle } from "./primitives";

const quotes = [
  {
    text: "Ароматизаторы MOLECULA дают удивительно чистый вкус без малейшего химического привкуса. Спирали и хлопок служат значительно дольше благодаря полному отсутствию сахарозы и смол.",
    name: "Главный технолог",
    company: "LiquidLab, контрактное производство",
  },
  {
    text: "Мы полностью перевели свою безникотиновую линейку на MOLECULA. Идеальная повторяемость профиля от партии к партии — технологическое попадание 10 из 10.",
    name: "Основатель бренда",
    company: "VapeCloud Network",
  },
  {
    text: "Быстрая отгрузка, прозрачные паспорта безопасности MSDS и честная концентрация. С первой же дегустационной партии поняли, что это новый уровень сырья.",
    name: "Руководитель закупок",
    company: "AromaDistro, оптовая сеть",
  },
];

export function Trust() {
  return (
    <section id="standards" className="py-24 md:py-32">
      <div className="container-midu">
        <Reveal>
          <SectionTitle
            lead="Качество, подтвержденное тестами."
            trail="Фармацевтическая чистота. Стабильность каждой партии."
          />
        </Reveal>

        <div className="mt-12 grid gap-5 lg:grid-cols-[0.8fr_2fr]">
          <Reveal>
            <div className="grain-card flex h-full flex-col justify-between gap-8 rounded-3xl p-7 bg-gradient-to-br from-purple-50/80 via-white to-white border-purple-200 dark:from-purple-950/25 dark:via-[#0c0c10] dark:to-[#0c0c10] dark:border-white/10">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-[#5D00FF]/10 text-[#5D00FF] dark:bg-[#5D00FF]/25">
                <ShieldCheck className="size-6 text-[#5D00FF] dark:text-purple-400" />
              </div>
              <div>
                <p className="text-3xl font-semibold tracking-tight text-foreground">150+ производств</p>
                <p className="mt-2 font-mono text-xs text-muted-foreground">
                  доверяют формулам MOLECULA по всей стране
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  <span className="rounded-md border border-purple-200 bg-purple-100/70 px-2.5 py-1 font-mono text-[11px] font-medium text-[#5D00FF] dark:bg-purple-950/50 dark:border-purple-500/30 dark:text-purple-300">
                    USP / EP Grade
                  </span>
                  <span className="rounded-md border border-purple-200 bg-purple-100/70 px-2.5 py-1 font-mono text-[11px] font-medium text-[#5D00FF] dark:bg-purple-950/50 dark:border-purple-500/30 dark:text-purple-300">
                    0% Nicotine
                  </span>
                </div>
              </div>
            </div>
          </Reveal>

          <div className="grid gap-5 sm:grid-cols-2">
            {quotes.map((q, i) => (
              <Reveal key={q.company} delay={i * 0.07}>
                <figure className="grain-card flex h-full flex-col gap-6 rounded-3xl p-7">
                  <blockquote className="leading-relaxed text-muted-foreground text-sm">
                    «{q.text}»
                  </blockquote>
                  <figcaption className="mt-auto pt-4 border-t border-border">
                    <p className="font-medium text-foreground">{q.name}</p>
                    <p className="font-mono text-xs text-muted-foreground mt-0.5">
                      {q.company}
                    </p>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
