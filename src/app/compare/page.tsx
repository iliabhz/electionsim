import Link from "next/link";
import CompareGrid from "@/components/sim/CompareGrid";
import SandboxSetup from "@/components/sim/SandboxSetup";

export const metadata = {
  title: "مقایسهٔ نظام‌ها",
};

export default function ComparePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <nav className="mb-6 text-sm">
        <Link href="/sandbox" className="text-blue-600 hover:underline">
          ← آزمایشگاه آزاد
        </Link>
      </nav>
      <h1 className="text-3xl font-extrabold">
        یک انتخابات، هفت برنده؟ مقایسهٔ همهٔ نظام‌ها
      </h1>
      <p className="mt-3 max-w-2xl leading-8 text-neutral-600 dark:text-neutral-400">
        همان پروفایل رأی‌دهندگان را در همهٔ نظام‌ها هم‌زمان ببینید. تنظیمات
        پایین (نامزدها، گروه‌ها و تعداد صندلی) با آزمایشگاه آزاد مشترک است —
        هر تغییری بدهید، همهٔ کارت‌ها فوراً به‌روز می‌شوند.
      </p>
      <div className="mt-8 space-y-8">
        <SandboxSetup titleFa="سناریوها" />
        <div className="border-t border-neutral-200 pt-8 dark:border-neutral-800">
          <CompareGrid />
        </div>
      </div>
    </div>
  );
}
