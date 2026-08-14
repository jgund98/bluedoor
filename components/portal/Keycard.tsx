"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Keycard({ studio }: { studio: string }) {
  const [note, setNote] = useState<string | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.1, ease: [0.19, 1, 0.22, 1] }}
      className="relative w-full max-w-[440px]"
    >
      {/* the medallion, set into the card edge like an escutcheon */}
      <Link
        href="/"
        aria-label="Bluedoor Building — home"
        className="absolute -top-[27px] left-1/2 z-10 -translate-x-1/2"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/logo.png"
          alt=""
          className="w-[54px] rounded-full ring-[6px] ring-porcelain transition-opacity duration-500 hover:opacity-80"
        />
      </Link>

      <div className="bg-porcelain px-7 pb-9 pt-14 shadow-[0_50px_100px_-40px_rgba(0,0,0,0.7)] lg:px-10 lg:pb-11 lg:pt-16">
        <div className="text-center">
          <span className="label block text-navy/70">Client Login</span>
          <h1 className="display mt-5 text-[26px] leading-[1.12] text-ink lg:text-[32px]">
            Welcome back.
          </h1>
          <p className="answer mx-auto mt-3 max-w-[300px] text-[15px] leading-[1.5] text-ink/55">
            For clients with a project under construction with {studio}.
          </p>
        </div>

        <form
          className="mt-9"
          onSubmit={(e) => {
            e.preventDefault();
            setNote("The portal opens with your project. Your project manager will issue your access code.");
          }}
        >
          <label htmlFor="p-email" className="label block text-navy/70">
            Email
          </label>
          <input
            id="p-email"
            type="email"
            required
            className="answer mt-3 w-full rounded-none border-b border-navy/25 bg-transparent pb-2 text-[17px] text-ink outline-none transition-colors duration-500 focus:border-navy"
          />

          <label htmlFor="p-code" className="label mt-7 block text-navy/70">
            Access code
          </label>
          <input
            id="p-code"
            type="password"
            required
            className="answer mt-3 w-full rounded-none border-b border-navy/25 bg-transparent pb-2 text-[17px] tracking-[0.3em] text-ink outline-none transition-colors duration-500 focus:border-navy"
          />

          <button
            type="submit"
            className="label mt-9 w-full bg-navy py-4 text-porcelain transition-opacity duration-500 hover:opacity-85"
          >
            Enter
          </button>
        </form>

        {note && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="answer mt-5 text-center text-[15px] leading-[1.5] text-navy"
          >
            {note}
          </motion.p>
        )}

        <div className="mt-8 flex items-center justify-center gap-7 border-t border-navy/12 pt-6">
          <Link href="/" className="quiet-link inline-block whitespace-nowrap text-ink/55">
            Return home
          </Link>
          <Link href="/build-with-bluedoor/" className="quiet-link inline-block whitespace-nowrap text-ink/55">
            Not a client yet
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
