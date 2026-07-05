"use client";

import { useState, useTransition } from "react";

import { type Locale } from "@/lib/site-types";

type Props = {
  locale: Locale;
};

const copy = {
  en: {
    heading: "Bring a strategic request",
    name: "Name",
    email: "Email",
    company: "Company",
    message: "Tell me the opportunity",
    submit: "Send strategic request",
    success: "Your message is in. We will review and respond thoughtfully.",
    error: "Submission failed. Please try again after confirming the database schema is applied."
  },
  tr: {
    heading: "Stratejik talebinizi paylaşın",
    name: "Ad Soyad",
    email: "E-posta",
    company: "Şirket",
    message: "Fırsatı anlatın",
    submit: "Stratejik talebi gönder",
    success: "Mesajınız alındı. Dikkatle değerlendirip dönüş yapacağız.",
    error: "Gönderim başarısız oldu. Lütfen veritabanı şemasının uygulandığını doğrulayın ve tekrar deneyin."
  }
} as const;

const leadTypeLabels = {
  en: {
    partner: "Partnership",
    investor: "Investor",
    consulting: "Consulting",
    community: "Community"
  },
  tr: {
    partner: "Ortaklık",
    investor: "Yatırımcı",
    consulting: "Danışmanlık",
    community: "Topluluk"
  }
} as const;

type LeadType = keyof typeof leadTypeLabels.en;

export function LeadForm({ locale }: Props) {
  const [leadType, setLeadType] = useState<LeadType>("partner");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [isPending, startTransition] = useTransition();
  const labels = copy[locale];

  async function onSubmit(formData: FormData) {
    setStatus("idle");
    const payload = {
      leadType,
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      company: String(formData.get("company") ?? ""),
      message: String(formData.get("message") ?? ""),
      locale
    };

    const response = await fetch("/api/leads", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    setStatus(response.ok ? "success" : "error");
    if (response.ok) {
      const form = document.getElementById("lead-form") as HTMLFormElement | null;
      form?.reset();
    }
  }

  return (
    <div className="glass-panel rounded-[2rem] p-6 md:p-8" id="connect">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="kicker">{labels.heading}</p>
          <h3 className="display-title mt-2 text-3xl text-white md:text-4xl">
            {locale === "tr"
              ? "Yatırım, ortaklık ve dönüşüm taleplerini tek noktada toplayalım."
              : "Bring investment, partnership, and transformation requests into one deliberate channel."}
          </h3>
        </div>
      </div>
      <div className="mb-6 flex flex-wrap gap-3">
        {(Object.keys(leadTypeLabels[locale]) as LeadType[]).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setLeadType(item)}
            className={
              leadType === item
                ? "rounded-full border border-[#d4b06a]/50 bg-[#d4b06a] px-4 py-2 text-sm font-semibold text-[#07111f]"
                : "rounded-full border border-white/12 bg-white/6 px-4 py-2 text-sm text-white/72"
            }
          >
            {leadTypeLabels[locale][item]}
          </button>
        ))}
      </div>
      <form
        id="lead-form"
        className="grid gap-4 md:grid-cols-2"
        action={(formData) => startTransition(() => void onSubmit(formData))}
      >
        <input name="name" className="field" placeholder={labels.name} required />
        <input name="email" className="field" type="email" placeholder={labels.email} required />
        <input name="company" className="field md:col-span-2" placeholder={labels.company} />
        <textarea
          name="message"
          className="field min-h-40 md:col-span-2"
          placeholder={labels.message}
          required
        />
        <div className="md:col-span-2 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p
            className={
              status === "success"
                ? "text-sm text-emerald-300"
                : status === "error"
                  ? "text-sm text-rose-300"
                  : "text-sm text-white/45"
            }
          >
            {status === "success"
              ? labels.success
              : status === "error"
                ? labels.error
                : locale === "tr"
                  ? "Form Supabase'e kaydedilir."
                  : "The form persists directly to Supabase."}
          </p>
          <button className="cta-primary" type="submit" disabled={isPending}>
            {isPending ? "..." : labels.submit}
          </button>
        </div>
      </form>
    </div>
  );
}
