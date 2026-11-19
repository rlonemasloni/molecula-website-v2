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
          {/* Main Rectangular Card with Rich Purple Background & Vivid Animated Gradient */}
          <div className="relative rounded-3xl overflow-hidden p-3 sm:p-4 lg:p-4 bg-gradient-to-br from-[#3B0764] via-[#581C87] to-[#1E053A] shadow-2xl shadow-purple-950/40 border border-purple-400/30">
            {/* Dynamic Moving Gradient Mesh Background */}
            <motion.div
              animate={{
                backgroundPosition: ["0% 0%", "100% 100%", "0% 100%", "100% 0%", "0% 0%"],
              }}
              transition={{
                duration: 16,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,#7C3AED_0%,transparent_50%),radial-gradient(circle_at_80%_70%,#C026D3_0%,transparent_55%),radial-gradient(circle_at_50%_20%,#4F46E5_0%,transparent_45%),radial-gradient(circle_at_70%_30%,#A855F7_0%,transparent_50%)] bg-[length:200%_200%] opacity-80 pointer-events-none"
            />

            {/* Glowing Luminous Orb 1 - Vivid Violet/Lavender */}
            <motion.div
              animate={{
                x: ["-10%", "25%", "-15%", "-10%"],
                y: ["-15%", "20%", "30%", "-15%"],
                scale: [1, 1.35, 0.95, 1],
                opacity: [0.65, 0.9, 0.55, 0.65],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute -top-12 -left-12 size-96 bg-[radial-gradient(circle,rgba(168,85,247,0.7)_0%,rgba(124,58,237,0.4)_40%,transparent_70%)] blur-2xl rounded-full pointer-events-none"
            />

            {/* Glowing Luminous Orb 2 - Electric Magenta/Fuchsia */}
            <motion.div
              animate={{
                x: ["15%", "-20%", "10%", "15%"],
                y: ["20%", "-10%", "-20%", "20%"],
                scale: [1.1, 0.85, 1.3, 1.1],
                opacity: [0.55, 0.85, 0.5, 0.55],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute -bottom-16 left-1/4 size-96 bg-[radial-gradient(circle,rgba(217,70,239,0.65)_0%,rgba(192,38,211,0.35)_45%,transparent_70%)] blur-2xl rounded-full pointer-events-none"
            />

            {/* Glowing Luminous Orb 3 - Radiant Indigo/Violet Shimmer */}
            <motion.div
              animate={{
                x: ["-5%", "15%", "-20%", "-5%"],
                y: ["10%", "-15%", "15%", "10%"],
                scale: [0.95, 1.25, 1, 0.95],
                opacity: [0.5, 0.8, 0.45, 0.5],
              }}
              transition={{
                duration: 12,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute top-1/4 right-1/3 size-80 bg-[radial-gradient(circle,rgba(129,140,248,0.6)_0%,rgba(99,102,241,0.3)_40%,transparent_70%)] blur-3xl rounded-full pointer-events-none"
            />

            {/* Diagonal Sweeping Soft Iridescent Sheen */}
            <motion.div
              animate={{
                x: ["-100%", "200%"],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
                repeatDelay: 2,
              }}
              className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-white/15 to-transparent skew-x-[-25deg] pointer-events-none"
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
