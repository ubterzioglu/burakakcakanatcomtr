import Link from "next/link";

export default function NotFound() {
  return (
    <div className="site-frame flex min-h-screen items-center justify-center px-6">
      <div className="section-shell max-w-2xl text-center">
        <p className="kicker">404</p>
        <h1 className="display-title mt-4 text-5xl text-white">This page slipped outside the active architecture.</h1>
        <p className="mt-5 text-base leading-8 text-white/62">
          The requested page does not exist or is not currently published.
        </p>
        <Link href="/" className="cta-primary mt-8">
          Return home
        </Link>
      </div>
    </div>
  );
}
