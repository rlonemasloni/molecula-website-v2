import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Reveal, SectionTitle } from "./primitives";

const faqs = [
  {
    q: "Каковы стандарты качества и чистоты ваших ароматизаторов?",
    a: "Вся линейка продукции MOLECULA производится по строгим стандартам USP/EP. Это 100% чистые органические пищевые ароматизаторы без токсичных примесей, диацетила и вредных стабилизаторов, созданные для безупречной вкусопередачи.",
  },
  {
    q: "Какая рекомендуемая рабочая концентрация ароматизаторов?",
    a: "Средняя рабочая концентрация составляет от 4% до 8% в зависимости от рецептуры и вкусового направления (фрукты — 4–6%, десерты — 6–9%, холодок — 1–3%). Каждая позиция сопровождается технологической картой с точными рекомендациями наших химиков-флейвористов.",
  },
  {
    q: "Какие документы и сертификаты предоставляются?",
    a: "С каждой партией вы получаете полный пакет юридических документов: декларации о соответствии ТР ТС (ЕАС), паспорта безопасности MSDS, сертификаты качества USP/EP и результаты газовой хроматографии (GC/MS).",
  },
  {
    q: "Как получить бесплатные дегустационные образцы?",
    a: "Для производств, дистрибьюторов и торговых партнеров мы бесплатно предоставляем стартовый дегустационный бокс из 6–10 популярных вкусов по 10 мл. Заполните форму внизу страницы или напишите нашему менеджеру.",
  },
  {
    q: "Оставляют ли ваши ароматизаторы осадок или нагар?",
    a: "В наших формулах полностью отсутствуют диацетил, ацетилпропионил, сахароза и тяжелые смолы. Благодаря абсолютной чистоте сырья нагар и осадок отсутствуют, обеспечивая стабильный и чистый вкус.",
  },
  {
    q: "Возможна ли разработка эксклюзивного вкуса под наш бренд?",
    a: "Да. Наш R&D-отдел занимается контрактным синтезом уникальных вкусовых формул (Private Label). Мы передаем рецептуру в вашу полную интеллектуальную собственность и гарантируем ненарушение эксклюзивности.",
  },
  {
    q: "Каковы минимальные объемы заказа и сроки отгрузки?",
    a: "Минимальный оптовый заказ — от 10 литров концентрата или от 100 флаконов в фасовке 10/30 мл. Стандартные позиции со склада отгружаются в течение 24–48 часов по всей России и странам СНГ.",
  },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="pb-24 md:pb-32">
      <div className="container-midu">
        <Reveal>
          <SectionTitle lead="Часто задаваемые" trail="вопросы." />
        </Reveal>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {faqs.map((item, i) => {
            const isOpen = open === i;
            return (
              <Reveal key={item.q} delay={(i % 2) * 0.05}>
                <div className="grain-card h-full rounded-2xl">
                  <button
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="flex w-full items-start justify-between gap-6 p-6 text-left"
                  >
                    <span className="font-medium text-foreground">{item.q}</span>
                    <motion.span
                      animate={{ rotate: isOpen ? 45 : 0 }}
                      transition={{ duration: 0.3 }}
                      className={`mt-1 flex size-6 shrink-0 items-center justify-center rounded-full border transition-colors ${
                        isOpen
                          ? "border-[#5D00FF] bg-[#5D00FF] text-white"
                          : "border-purple-200 bg-purple-50/60 text-[#5D00FF] dark:border-white/10 dark:bg-white/5 dark:text-purple-300"
                      }`}
                    >
                      <Plus className="size-3.5" />
                    </motion.span>
                  </button>
                  {isOpen ? (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      className="px-6 pb-6 text-sm leading-relaxed text-muted-foreground"
                    >
                      {item.a}
                    </motion.div>
                  ) : null}
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
