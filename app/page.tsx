export const metadata = {
  title: "Burak Akçakanat | Yakında",
  description:
    "Burak Akçakanat'ın yeni stratejik platformu yapım aşamasında. Çok yakında yayında."
};

export default function ComingSoonPage() {
  return (
    <main className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-[#05070c] px-6 py-16">
      {/* Ambient glow field */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(60% 50% at 20% 10%, rgba(212,176,106,0.16), transparent 60%)," +
            "radial-gradient(50% 45% at 85% 8%, rgba(143,184,205,0.14), transparent 58%)," +
            "radial-gradient(70% 70% at 50% 115%, rgba(212,176,106,0.10), transparent 60%)," +
            "linear-gradient(180deg, #05070c 0%, #04060a 55%, #030408 100%)"
        }}
      />
      {/* Grid texture */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.25]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)," +
            "linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage:
            "radial-gradient(120% 80% at 50% 20%, black, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(120% 80% at 50% 20%, black, transparent 75%)"
        }}
      />
      {/* Floating orbs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-10 -z-10 h-72 w-72 rounded-full blur-[130px]"
        style={{ background: "rgba(212,176,106,0.22)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 bottom-10 -z-10 h-80 w-80 rounded-full blur-[140px]"
        style={{ background: "rgba(143,184,205,0.20)" }}
      />

      <div className="mx-auto flex w-full max-w-3xl flex-col items-center text-center">
        <div className="mb-8 flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.03] px-5 py-2 backdrop-blur-xl">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#d4b06a]/70" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#d4b06a]" />
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-[0.32em] text-white/60">
            Yapım Aşamasında
          </span>
        </div>

        <p className="text-sm uppercase tracking-[0.3em] text-white/40">
          Burak Akçakanat
        </p>

        <h1 className="mt-5 bg-gradient-to-br from-white via-white to-[#d4b06a] bg-clip-text text-[clamp(2.6rem,7vw,5rem)] font-bold leading-[1.02] tracking-[-0.04em] text-transparent">
          Çok yakında
          <br />
          yayında.
        </h1>

        <p className="mt-6 max-w-xl text-base leading-8 text-white/60 md:text-lg">
          Yeni stratejik platform üzerinde çalışıyoruz. Venture mimarisi,
          liderlik zekâsı ve büyüme stratejisi tek bir premium deneyimde
          buluşuyor.
        </p>

        <div className="mt-10 flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.28em] text-white/25">
          <span>Doha</span>
          <span className="h-1 w-1 rounded-full bg-white/20" />
          <span>Dubai</span>
          <span className="h-1 w-1 rounded-full bg-white/20" />
          <span>Istanbul</span>
        </div>
      </div>
    </main>
  );
}
