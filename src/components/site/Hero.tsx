import { motion } from "framer-motion";
import { useRef } from "react";

const HEADING_WORDS =
  "Создаем эталонные вкусовые профили на основе европейских пищевых компонентов.".split(
    " "
  );

export function Hero() {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <section id="top" ref={ref} className="relative overflow-hidden pb-16 md:pb-24">
      <div className="relative min-h-screen w-full overflow-hidden flex flex-col justify-end">
        {/* Background Video (Clean, 100% visible, no shading/lightening) */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          src="/Moleculawebcu.mp4"
        />
      </div>

      <div className="container-midu relative mt-24 md:mt-36">
        <motion.h2
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.05,
              },
            },
          }}
          className="max-w-5xl text-left text-3xl leading-[1.2] font-bold tracking-tight sm:text-5xl sm:leading-[1.15] md:text-6xl md:leading-[1.1] lg:text-[4.25rem] lg:leading-[1.08]"
        >
          {HEADING_WORDS.map((word, i) => (
            <motion.span
              key={i}
              variants={{
                hidden: {
                  opacity: 0,
                  y: 40,
                  filter: "blur(14px)",
                },
                visible: {
                  opacity: 1,
                  y: 0,
                  filter: "blur(0px)",
                  transition: {
                    duration: 0.85,
                    ease: [0.16, 1, 0.3, 1],
                  },
                },
              }}
              className="inline-block mr-[0.28em] will-change-[transform,opacity,filter]"
            >
              {word}
            </motion.span>
          ))}
        </motion.h2>
      </div>
    </section>
  );
}
export default Hero;
