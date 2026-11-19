import { motion } from "framer-motion";
import { Check, ArrowUpRight } from "lucide-react";
import { Reveal, SectionTitle, PillButton } from "./primitives";

const plans = [
  {
    name: "Базовый Опт",
    price: "от 10 л",
    unit: "/ минимальный заказ",
    accent: "text-[#5D00FF]",
    dot: "bg-[#5D00FF]",
    features: [
      "Каталог из 40+ сертифицированных вкусов",
      "Фасовка: канистры 1 л, 5 л или флаконы 10/30 мл",
      "Экспресс-отгрузка со склада в течение 48 часов",
      "Полный пакет деклараций EAC и паспортов MSDS",
      "100% органическая пищевая чистота",
    ],
  },
  {
    name: "Дистрибьютор Pro",
    price: "от 50 л",
    unit: "/ регулярные поставки",
    accent: "text-[#7C3AED]",
    dot: "bg-[#7C3AED]",
    features: [
      "Специальная шкала оптовых цен со скидкой до 35%",
      "Персональный технолог и поддержка при замесе",
      "Резервирование сырья под ваши производственные планы",
      "Бесплатные образцы новых экспериментальных линеек",
      "Индивидуальная калибровка концентрации",
    ],
  },
];

export function Pricing() {
  return (
    <section id="partnership" className="relative overflow-hidden py-24 md:py-32">
      <div className="glow-top pointer-events-none absolute inset-x-0 -top-40 h-[420px] opacity-60" />
      <div className="container-midu relative">
        <Reveal>
          <SectionTitle
            lead="Форматы поставок:"
            trail="регулярный опт или разработка рецептур под ключ."
          />
        </Reveal>

        <Reveal delay={0.06}>
          <p className="mt-6 font-mono text-xs text-muted-foreground uppercase tracking-wider">
            Оптовые программы для ритейла и производств
          </p>
        </Reveal>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {plans.map((plan, i) => (
            <Reveal key={plan.name} delay={i * 0.08}>
              <motion.div
                whileHover={{ y: -6 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className={`grain-card h-full rounded-3xl p-7 flex flex-col justify-between ${
                  i === 1 ? "border-purple-300 bg-gradient-to-b from-purple-50/50 to-white" : ""
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`size-2 rounded-full ${plan.dot}`} />
                    <span className={`font-mono text-xs font-semibold ${plan.accent}`}>
                      {plan.name}
                    </span>
                  </div>
                  <p className="mt-6 flex items-end gap-2">
                    <span className="text-4xl font-semibold tracking-tight text-foreground">
                      {plan.price}
                    </span>
                    <span className="pb-1 font-mono text-xs text-muted-foreground">
                      {plan.unit}
                    </span>
                  </p>
                  <ul className="mt-7 space-y-3">
                    {plan.features.map((f) => (
                      <li
                        key={f}
                        className="flex items-start gap-3 text-sm text-muted-foreground"
                      >
                        <Check className="mt-0.5 size-4 shrink-0 text-[#5D00FF]" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-8">
                  <PillButton
                    variant={i === 0 ? "ghost" : "primary"}
                    href="#contact"
                    className="w-full justify-center"
                  >
                    Запросить прайс-лист
                  </PillButton>
                </div>
              </motion.div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.1}>
          <p className="mt-14 font-mono text-xs text-muted-foreground uppercase tracking-wider">
            Контрактное производство и Private Label
          </p>
          <motion.div
            whileHover={{ y: -6 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="grain-card mt-6 rounded-3xl p-7 md:p-9 bg-gradient-to-r from-purple-50/60 via-white to-white border-purple-200 dark:from-purple-950/25 dark:via-[#0c0c10] dark:to-[#0c0c10] dark:border-white/10"
          >
            <div className="grid gap-6 md:grid-cols-[1.5fr_1fr] md:items-center">
              <div>
                <span className="font-mono text-xs font-semibold text-[#5D00FF]">
                  Эксклюзивная разработка
                </span>
                <h3 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
                  Создание вашей собственной вкусовой линейки под ключ
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  Разработаем уникальные органолептические профили, проведем
                  хроматографические тесты, подберем идеальную термостойкость и передадим
                  полные эксклюзивные права на формулу с гарантией стабильности и чистоты вкуса.
                </p>
              </div>
              <div className="flex flex-col items-start md:items-end justify-between gap-4">
                <div>
                  <span className="text-3xl font-semibold tracking-tight text-foreground">от 45 000 ₽</span>
                  <p className="font-mono text-xs text-muted-foreground">
                    включая 3 итерации образцов
                  </p>
                </div>
                <PillButton variant="primary" href="#contact">
                  <ArrowUpRight className="size-4" />
                  Заказать разработку
                </PillButton>
              </div>
            </div>
          </motion.div>
        </Reveal>
      </div>
    </section>
  );
}
