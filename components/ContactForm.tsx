"use client";

import { useState, type FormEvent } from "react";
import { Button } from "./Button";
import { cn } from "@/lib/utils";

interface Fields {
  name: string;
  phone: string;
  email: string;
  subject: string;
  message: string;
}

const empty: Fields = { name: "", phone: "", email: "", subject: "", message: "" };

type Status = "idle" | "submitting" | "success" | "error";

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Client-validated contact form that posts to the /api/contact route. */
export function ContactForm() {
  const [values, setValues] = useState<Fields>(empty);
  const [errors, setErrors] = useState<Partial<Record<keyof Fields, string>>>({});
  const [status, setStatus] = useState<Status>("idle");

  function validate(): boolean {
    const next: Partial<Record<keyof Fields, string>> = {};
    if (!values.name.trim()) next.name = "Please enter your name.";
    if (!values.email.trim()) next.email = "Please enter your email.";
    else if (!emailRe.test(values.email)) next.email = "Enter a valid email address.";
    if (!values.subject.trim()) next.subject = "Please add a subject.";
    if (!values.message.trim()) next.message = "Please enter a message.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function update<K extends keyof Fields>(key: K, value: string) {
    setValues((v) => ({ ...v, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!validate()) return;
    setStatus("submitting");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error("Request failed");
      setStatus("success");
      setValues(empty);
    } catch {
      setStatus("error");
    }
  }

  const fieldClass = (key: keyof Fields) =>
    cn(
      "w-full rounded-xl border bg-white px-4 py-3 text-sm text-navy placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-accent/60",
      errors[key] ? "border-red-400" : "border-slate-200",
    );

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-navy">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            value={values.name}
            onChange={(e) => update("name", e.target.value)}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "name-error" : undefined}
            className={fieldClass("name")}
            placeholder="Jane Doe"
          />
          {errors.name && (
            <p id="name-error" className="mt-1 text-xs text-red-500">
              {errors.name}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-navy">
            Phone
          </label>
          <input
            id="phone"
            type="tel"
            autoComplete="tel"
            value={values.phone}
            onChange={(e) => update("phone", e.target.value)}
            className={fieldClass("phone")}
            placeholder="+1 (555) 000-0000"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-navy">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={(e) => update("email", e.target.value)}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-error" : undefined}
            className={fieldClass("email")}
            placeholder="jane@company.com"
          />
          {errors.email && (
            <p id="email-error" className="mt-1 text-xs text-red-500">
              {errors.email}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="subject" className="mb-1.5 block text-sm font-medium text-navy">
            Subject <span className="text-red-500">*</span>
          </label>
          <input
            id="subject"
            type="text"
            value={values.subject}
            onChange={(e) => update("subject", e.target.value)}
            aria-invalid={!!errors.subject}
            aria-describedby={errors.subject ? "subject-error" : undefined}
            className={fieldClass("subject")}
            placeholder="How can we help?"
          />
          {errors.subject && (
            <p id="subject-error" className="mt-1 text-xs text-red-500">
              {errors.subject}
            </p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-navy">
          Message <span className="text-red-500">*</span>
        </label>
        <textarea
          id="message"
          rows={5}
          value={values.message}
          onChange={(e) => update("message", e.target.value)}
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? "message-error" : undefined}
          className={cn(fieldClass("message"), "resize-y")}
          placeholder="Tell us about your goals..."
        />
        {errors.message && (
          <p id="message-error" className="mt-1 text-xs text-red-500">
            {errors.message}
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" variant="accent" size="lg" disabled={status === "submitting"}>
          {status === "submitting" ? "Sending..." : "Send Message"}
        </Button>
        <div aria-live="polite" role="status" className="text-sm">
          {status === "success" && (
            <span className="text-accent-600">
              Thanks! We&apos;ll be in touch within one business day.
            </span>
          )}
          {status === "error" && (
            <span className="text-red-500">
              Something went wrong. Please try again or email us directly.
            </span>
          )}
        </div>
      </div>
    </form>
  );
}
