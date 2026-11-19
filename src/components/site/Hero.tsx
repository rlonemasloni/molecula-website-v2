import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { MoleculaWordmark } from "./MoleculaWordmark";

const HEADING_WORDS =
  "Создаем эталонные вкусовые профили на основе европейских пищевых компонентов.".split(
    " "
  );

export function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const wordmarkY = useTransform(scrollYProgress, [0, 1], [0, -40]);

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

        {/* Foreground Wordmark (Purple with multiply blend mode) */}
        <motion.div
          style={{ y: wordmarkY, mixBlendMode: "multiply" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 w-full pointer-events-none mix-blend-multiply px-3 sm:px-6 md:px-8 pb-3 sm:pb-6 md:pb-8"
        >
          <MoleculaWordmark variant="hero" className="w-full max-w-none" />
        </motion.div>
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
          className="mx-auto max-w-3xl text-center text-3xl leading-[1.2] font-semibold tracking-tight sm:text-4xl md:text-[2.75rem]"
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
