"use client";

import { useState, type FormEvent } from "react";
import Select from "react-select";
import { Button } from "./Button";
import { cn } from "@/lib/utils";
import { countries, defaultCountry, type Country } from "@/lib/countries";

interface Fields {
  name: string;
  countryCode: string; // dial code, e.g. "+91"
  phone: string; // local number, digits only
  email: string;
  subject: string;
  message: string;
}

const initial: Fields = {
  name: "",
  countryCode: defaultCountry.dialCode,
  phone: "",
  email: "",
  subject: "",
  message: "",
};

type Status = "idle" | "submitting" | "success" | "error";

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const MESSAGE_MIN = 20;
const PHONE_MIN = 7;
const PHONE_MAX = 15;

/** react-select option: spreads a Country and adds a searchable label. */
interface CountryOption extends Country {
  value: string; // iso2 (unique)
  label: string; // "India +91" — searched by react-select's default filter
}

const countryOptions: CountryOption[] = countries.map((c) => ({
  ...c,
  value: c.iso2,
  label: `${c.name} ${c.dialCode}`,
}));

/** Per-field validation. Returns an error string, or undefined when valid. */
function fieldError(key: keyof Fields, v: Fields): string | undefined {
  switch (key) {
    case "name":
      return v.name.trim() ? undefined : "Please enter your name.";
    case "phone":
      if (!v.phone) return "Please enter your phone number.";
      if (v.phone.length < PHONE_MIN)
        return `Enter a valid phone number (min ${PHONE_MIN} digits).`;
      if (v.phone.length > PHONE_MAX)
        return `Phone number is too long (max ${PHONE_MAX} digits).`;
      return undefined;
    case "email":
      if (!v.email.trim()) return "Please enter your email.";
      return emailRe.test(v.email.trim())
        ? undefined
        : "Enter a valid email address.";
    case "subject":
      return v.subject.trim() ? undefined : "Please add a subject.";
    case "message":
      if (!v.message.trim()) return "Please enter a message.";
      return v.message.trim().length < MESSAGE_MIN
        ? `Message must be at least ${MESSAGE_MIN} characters (currently ${v.message.trim().length}).`
        : undefined;
    default:
      return undefined;
  }
}

/** Client-validated contact form that posts to the /api/contact route. */
export function ContactForm() {
  const [values, setValues] = useState<Fields>(initial);
  const [selectedCountry, setSelectedCountry] = useState<CountryOption>(
    countryOptions.find((o) => o.iso2 === defaultCountry.iso2) ?? countryOptions[0],
  );
  const [errors, setErrors] = useState<Partial<Record<keyof Fields, string>>>({});
  const [status, setStatus] = useState<Status>("idle");

  /** Update a value and clear its error while the user is correcting it. */
  function update<K extends keyof Fields>(key: K, value: string) {
    setValues((v) => ({ ...v, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  }

  /** Show a field's error once the user leaves it (first blur). */
  function handleBlur(key: keyof Fields) {
    setErrors((e) => ({ ...e, [key]: fieldError(key, values) }));
  }

  function validateAll(v: Fields): Partial<Record<keyof Fields, string>> {
    const next: Partial<Record<keyof Fields, string>> = {};
    (Object.keys(v) as (keyof Fields)[]).forEach((key) => {
      const err = fieldError(key, v);
      if (err) next[key] = err;
    });
    return next;
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const found = validateAll(values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setStatus("submitting");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          subject: values.subject,
          message: values.message,
          // Combine dial code + local number into a single E.164-style value.
          phone: `${values.countryCode}${values.phone}`,
        }),
      });
      if (!res.ok) throw new Error("Request failed");
      setStatus("success");
      setValues(initial);
      setSelectedCountry(
        countryOptions.find((o) => o.iso2 === defaultCountry.iso2) ?? countryOptions[0],
      );
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
            onBlur={() => handleBlur("name")}
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
            Phone <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2">
            <div className="w-28 shrink-0">
              <Select<CountryOption>
                instanceId="country-code"
                inputId="country-code"
                aria-label="Country dial code"
                options={countryOptions}
                value={selectedCountry}
                onChange={(opt) => {
                  if (!opt) return;
                  setSelectedCountry(opt);
                  update("countryCode", opt.dialCode);
                }}
                isSearchable
                unstyled
                menuPlacement="auto"
                components={{ IndicatorSeparator: () => null }}
                formatOptionLabel={(opt, meta) =>
                  meta.context === "menu" ? (
                    <span className="flex items-center gap-2">
                      <span className="text-base leading-none">{opt.flag}</span>
                      <span className="flex-1 truncate">{opt.name}</span>
                      <span className="text-slate-400">{opt.dialCode}</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      <span className="text-base leading-none">{opt.flag}</span>
                      <span>{opt.dialCode}</span>
                    </span>
                  )
                }
                classNames={{
                  control: (s) =>
                    cn(
                      "rounded-xl border bg-white px-2 py-[0.5625rem] text-sm text-navy transition-colors",
                      s.isFocused
                        ? "border-accent ring-2 ring-accent/60"
                        : "border-slate-200",
                    ),
                  valueContainer: () => "gap-1",
                  placeholder: () => "text-slate-400",
                  input: () => "text-navy",
                  dropdownIndicator: (s) =>
                    cn("text-slate-400", s.isFocused && "text-accent"),
                  menu: () =>
                    "mt-1 min-w-[18rem] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg",
                  menuList: () => "max-h-64 py-1",
                  option: (s) =>
                    cn(
                      "cursor-pointer px-3 py-2 text-sm text-navy",
                      s.isFocused && "bg-accent/10",
                      s.isSelected && "bg-accent/20 font-medium",
                    ),
                  noOptionsMessage: () => "px-3 py-2 text-sm text-slate-400",
                }}
              />
            </div>
            <input
              id="phone"
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              value={values.phone}
              onChange={(e) =>
                update("phone", e.target.value.replace(/\D/g, "").slice(0, PHONE_MAX))
              }
              onBlur={() => handleBlur("phone")}
              aria-invalid={!!errors.phone}
              aria-describedby={errors.phone ? "phone-error" : undefined}
              className={cn(fieldClass("phone"), "min-w-0 flex-1")}
              placeholder="98765 43210"
            />
          </div>
          {errors.phone && (
            <p id="phone-error" className="mt-1 text-xs text-red-500">
              {errors.phone}
            </p>
          )}
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
            onBlur={() => handleBlur("email")}
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
            onBlur={() => handleBlur("subject")}
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
        <div className="mb-1.5 flex items-baseline justify-between gap-2">
          <label htmlFor="message" className="block text-sm font-medium text-navy">
            Message <span className="text-red-500">*</span>
          </label>
          <span
            className={cn(
              "text-xs",
              values.message.trim().length < MESSAGE_MIN
                ? "text-slate-400"
                : "text-accent-600",
            )}
          >
            {values.message.trim().length}/{MESSAGE_MIN}
          </span>
        </div>
        <textarea
          id="message"
          rows={5}
          value={values.message}
          onChange={(e) => update("message", e.target.value)}
          onBlur={() => handleBlur("message")}
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
