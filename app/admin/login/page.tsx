import { redirect } from "next/navigation";

import { AdminLoginForm } from "@/components/admin/login-form";
import { isAdminAuthenticated } from "@/lib/auth";

export default async function AdminLoginPage() {
  if (await isAdminAuthenticated()) {
    redirect("/admin");
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-5 py-12">
      <div className="w-full max-w-sm space-y-8">
        <div className="space-y-3 text-center">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500/90 text-sm font-bold text-white shadow-[0_10px_30px_rgba(79,70,229,0.4)]">
            BA
          </div>
          <div className="space-y-1">
            <h1 className="text-xl font-semibold tracking-tight text-white">Admin girişi</h1>
            <p className="text-sm text-zinc-500">Devam etmek için admin şifresini girin.</p>
          </div>
        </div>
        <AdminLoginForm />
      </div>
    </div>
  );
}
