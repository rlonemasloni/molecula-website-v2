import { Reveal } from "./primitives";

const faqs = [
  {
    number: "1",
    q: "КАКОВЫ СТАНДАРТЫ КАЧЕСТВА?",
    a: "Вся линейка продукции MOLECULA производится по строгим фармацевтическим стандартам USP/EP. 100% органические пищевые ароматизаторы высокой чистоты без токсичных примесей, диацетила и вредных стабилизаторов.",
  },
  {
    number: "2",
    q: "КАКИЕ ДОКУМЕНТЫ (СЕРТИФИКАТ) ПРЕДОСТАВЛЯЮТСЯ?",
    a: "С каждой партией вы получаете полный комплект юридических документов: декларации о соответствии ТР ТС (ЕАС), паспорта безопасности MSDS, сертификаты качества USP/EP и протоколы хроматографии GC/MS.",
  },
];

export function Faq() {
  return (
    <section id="faq" className="py-24 md:py-36 border-t border-border/50">
      <div className="container-midu">
        {/* Section Header matching reference */}
        <Reveal>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-14 md:mb-20">
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-foreground uppercase leading-[1.08]">
              Часто задаваемые<br />вопросы
            </h2>
            <span className="font-mono text-xs sm:text-sm uppercase tracking-widest text-muted-foreground/60 sm:pt-2">
              / FAQ
            </span>
          </div>
        </Reveal>

        {/* Minimalist Editorial List matching reference image */}
        <div className="border-b border-border/80">
          {faqs.map((item, i) => (
            <Reveal key={item.number} delay={i * 0.1}>
              <div className="group border-t border-border/80 py-8 sm:py-10 md:py-12 transition-colors duration-300">
                <div className="grid grid-cols-1 md:grid-cols-[70px_1.3fr_1fr] lg:grid-cols-[90px_1.4fr_1fr] items-start gap-4 md:gap-8">
                  {/* Column 1: Number */}
                  <span className="text-xl sm:text-2xl font-normal text-muted-foreground/50 transition-colors group-hover:text-foreground">
                    {item.number}
                  </span>

                  {/* Column 2: Question (All-Caps Bold Sans-Serif) */}
                  <h3 className="text-xl sm:text-2xl md:text-[1.75rem] font-bold tracking-tight text-foreground uppercase leading-snug">
                    {item.q}
                  </h3>

                  {/* Column 3: Answer Prose */}
                  <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
                    {item.a}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Faq;
