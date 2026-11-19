import React, { useState } from "react";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Reveal } from "./primitives";

export function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 600);
  };

  const handleReset = () => {
    setFormData({ name: "", phone: "", email: "", message: "" });
    setIsSubmitted(false);
  };

  return (
    <section id="contact" className="py-20 md:py-28 overflow-hidden">
      <div className="container-midu">
        <Reveal>
          {/* Main Rectangular Card with Rich Purple Background & Shimmering Ambient Light */}
          <div className="relative rounded-3xl overflow-hidden p-3 sm:p-4 lg:p-4 bg-gradient-to-br from-[#4C1D95] via-[#6D28D9] to-[#3B0764] shadow-2xl shadow-purple-950/25 border border-purple-500/20">
            {/* Base ambient lighting */}
            <div className="absolute -top-24 -left-24 size-80 bg-[#8B5CF6]/35 blur-3xl rounded-full pointer-events-none" />
            <div className="absolute -bottom-24 left-1/3 size-80 bg-[#A855F7]/30 blur-3xl rounded-full pointer-events-none" />

            {/* Slow-shifting soft white & purple iridescent shimmer */}
            <motion.div
              animate={{
                x: ["-8%", "18%", "-12%", "-8%"],
                y: ["-10%", "12%", "18%", "-10%"],
                scale: [1, 1.15, 0.92, 1],
                opacity: [0.22, 0.35, 0.2, 0.22],
              }}
              transition={{
                duration: 11,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute -top-1/4 -left-1/4 w-[130%] h-[130%] bg-[radial-gradient(ellipse_at_35%_45%,rgba(255,255,255,0.45)_0%,rgba(216,180,254,0.25)_25%,rgba(139,92,246,0.15)_50%,transparent_70%)] blur-2xl pointer-events-none"
            />
            <motion.div
              animate={{
                x: ["10%", "-15%", "8%", "10%"],
                y: ["12%", "-8%", "-15%", "12%"],
                scale: [1.05, 0.95, 1.12, 1.05],
                opacity: [0.18, 0.28, 0.16, 0.18],
              }}
              transition={{
                duration: 14,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute -bottom-1/4 -right-1/4 w-[120%] h-[120%] bg-[radial-gradient(circle_at_60%_55%,rgba(255,255,255,0.38)_0%,rgba(192,132,252,0.2)_30%,transparent_65%)] blur-2xl pointer-events-none"
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
              {/* Left Column: Direct title on the common purple background (NO inner frame / border) */}
              <div className="lg:col-span-5 px-6 sm:px-10 lg:pl-12 lg:pr-4 py-8 sm:py-12 flex flex-col justify-center text-white relative z-10">
                <h2 className="text-4xl sm:text-5xl lg:text-6xl xl:text-[4.25rem] font-black tracking-tight text-white leading-[1.04]">
                  Связаться
                  <br />
                  с нами
                </h2>
              </div>

              {/* Right Column: White Panel with Form */}
              <div className="lg:col-span-7 bg-white rounded-2xl p-6 sm:p-9 lg:p-10 flex flex-col justify-between text-zinc-900 shadow-xl relative z-10">
                {isSubmitted ? (
                  <div className="my-auto py-12 flex flex-col items-center justify-center text-center">
                    <div className="size-16 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 mb-5">
                      <CheckCircle2 className="size-9" />
                    </div>
                    <h3 className="text-2xl font-bold tracking-tight text-zinc-900 mb-2">
                      Заявка отправлена
                    </h3>
                    <p className="text-sm text-zinc-600 max-w-md mb-8">
                      Заявка отправлена, мы скоро свяжемся с вами для уточнения деталей и расчёта оптовых условий.
                    </p>
                    <button
                      type="button"
                      onClick={handleReset}
                      className="px-6 py-2.5 rounded-full bg-zinc-900 hover:bg-purple-900 text-white text-xs font-semibold tracking-wide transition-colors cursor-pointer"
                    >
                      Отправить ещё одно сообщение
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="flex flex-col justify-between h-full space-y-6">
                    <div className="space-y-4">
                      {/* Name */}
                      <div>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          placeholder="Ваше имя*"
                          className="w-full bg-zinc-100/90 rounded-xl px-4 py-3.5 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition-all border border-transparent focus:bg-white focus:ring-2 focus:ring-purple-600/30 focus:border-purple-600"
                        />
                      </div>

                      {/* Phone */}
                      <div>
                        <input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) =>
                            setFormData({ ...formData, phone: e.target.value })
                          }
                          placeholder="Номер телефона*"
                          className="w-full bg-zinc-100/90 rounded-xl px-4 py-3.5 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition-all border border-transparent focus:bg-white focus:ring-2 focus:ring-purple-600/30 focus:border-purple-600"
                        />
                      </div>

                      {/* Email */}
                      <div>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          placeholder="Электронная почта*"
                          className="w-full bg-zinc-100/90 rounded-xl px-4 py-3.5 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition-all border border-transparent focus:bg-white focus:ring-2 focus:ring-purple-600/30 focus:border-purple-600"
                        />
                      </div>

                      {/* Message */}
                      <div>
                        <textarea
                          rows={4}
                          required
                          value={formData.message}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              message: e.target.value,
                            })
                          }
                          placeholder="Ваше сообщение*"
                          className="w-full bg-zinc-100/90 rounded-xl px-4 py-3.5 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition-all border border-transparent focus:bg-white focus:ring-2 focus:ring-purple-600/30 focus:border-purple-600 resize-none"
                        />
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="rounded-full w-full py-3.5 bg-zinc-950 hover:bg-purple-950 text-white font-medium text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 shadow-sm"
                      >
                        {isSubmitting ? (
                          <span>Отправка заявки...</span>
                        ) : (
                          <>
                            <span>Отправить заявку</span>
                            <ArrowRight className="size-4" />
                          </>
                        )}
                      </button>
                    </div>

                    <p className="text-center text-xs text-zinc-400">
                      Ваши данные надёжно защищены и будут использованы только для ответа на вашу заявку
                    </p>
                  </form>
                )}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
export default Contact;
