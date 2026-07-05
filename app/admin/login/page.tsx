import { redirect } from "next/navigation";

import { AdminLoginForm } from "@/components/admin/login-form";
import { isAdminAuthenticated } from "@/lib/auth";

export default async function AdminLoginPage() {
  if (await isAdminAuthenticated()) {
    redirect("/admin");
  }

  return (
    <div className="mx-auto grid min-h-[80vh] max-w-6xl items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="space-y-5">
        <p className="kicker">Private studio</p>
        <h1 className="display-title max-w-4xl text-5xl text-white md:text-7xl">
          Admin surface for the premium narrative layer.
        </h1>
        <p className="max-w-2xl text-base leading-8 text-white/62">
          Sign in with the protected admin password to edit hero copy, ventures, insights, publications, and inbound leads stored in Supabase.
        </p>
      </section>
      <AdminLoginForm />
    </div>
  );
}
