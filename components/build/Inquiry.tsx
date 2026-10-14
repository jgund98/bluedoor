"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// 10-14: the same five things the homepage says Bluedoor does
const PROJECTS = ["New construction", "Renovation", "Condominium", "Historic renovation", "Estate management", "Not yet decided"];

type State = "idle" | "sending" | "sent" | "failed";

export default function Inquiry() {
  const [state, setState] = useState<State>("idle");
  const sent = state === "sent";

  // 10-14: this used to flip to "thank you" without sending anything. It now
  // posts to /api/inquiry/, which emails the studio; if that fails, the
  // visitor is told so instead of being thanked for a note nobody received.
  async function submit(form: HTMLFormElement) {
    setState("sending");
    const data = Object.fromEntries(new FormData(form).entries());
    try {
      const res = await fetch("/api/inquiry/", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = (await res.json().catch(() => ({}))) as { ok?: boolean };
      if (res.ok && json.ok) {
        form.reset();
        setState("sent");
      } else setState("failed");
    } catch {
      setState("failed");
    }
  }

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        {sent ? (
          <motion.div
            key="sent"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
            className="border border-navy/20 bg-porcelain px-7 py-12 text-center lg:px-12 lg:py-16"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/logo.png" alt="" className="mx-auto w-[46px] rounded-full" />
            <p className="answer mt-7 text-[23px] leading-[1.35] text-ink lg:text-[28px]">
              Thank you — your note has been received.
            </p>
            <p className="prose-lux mx-auto mt-4 max-w-[380px] text-[16px]">
              Every inquiry is read personally. You will hear back from the studio shortly.
            </p>
            <button onClick={() => setState("idle")} className="quiet-link mt-9 inline-block text-navy">
              Write another
            </button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            onSubmit={(e) => {
              e.preventDefault();
              if (state !== "sending") submit(e.currentTarget);
            }}
            className="relative border border-navy/15 bg-porcelain px-6 py-9 lg:px-10 lg:py-11"
          >
            <div className="grid grid-cols-1 gap-x-8 gap-y-7 sm:grid-cols-2">
              <Field label="Name" name="name" required />
              <Field label="Email" name="email" type="email" required />
              <Field label="Where you are building" name="where" placeholder="Palm Beach" />
              <div>
                <label htmlFor="project" className="label block text-navy/70">
                  The project
                </label>
                <select
                  id="project"
                  name="project"
                  defaultValue={PROJECTS[0]}
                  className="answer mt-3 w-full appearance-none rounded-none border-b border-navy/25 bg-transparent pb-2 text-[17px] text-ink outline-none transition-colors duration-500 focus:border-navy"
                >
                  {PROJECTS.map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* unseen by people; a bot that fills it is thanked and ignored */}
            <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
              <label htmlFor="company">Company</label>
              <input id="company" name="company" type="text" tabIndex={-1} autoComplete="off" />
            </div>

            <div className="mt-7">
              <label htmlFor="message" className="label block text-navy/70">
                A little about it
              </label>
              <textarea
                id="message"
                name="message"
                rows={3}
                className="answer mt-3 w-full resize-none rounded-none border-b border-navy/25 bg-transparent pb-2 text-[17px] leading-[1.6] text-ink outline-none transition-colors duration-500 placeholder:text-ink/30 focus:border-navy"
                placeholder="Architect, timing, anything you would like us to know."
              />
            </div>

            <div className="mt-9 flex items-center justify-between gap-6">
              <button
                type="submit"
                disabled={state === "sending"}
                className="label bg-navy px-8 py-4 text-porcelain transition-opacity duration-500 hover:opacity-85 disabled:opacity-60"
              >
                {state === "sending" ? "Sending" : "Send"}
              </button>
              <span className="answer hidden text-[14px] leading-[1.4] text-ink/45 sm:block">
                We reply to every inquiry.
              </span>
            </div>

            {state === "failed" && (
              <p role="alert" className="answer mt-6 text-[16px] leading-[1.5] text-ink/80">
                Your note could not be sent just now. Please try again in a moment.
              </p>
            )}
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="label block text-navy/70">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="answer mt-3 w-full rounded-none border-b border-navy/25 bg-transparent pb-2 text-[17px] text-ink outline-none transition-colors duration-500 placeholder:text-ink/30 focus:border-navy"
      />
    </div>
  );
}
