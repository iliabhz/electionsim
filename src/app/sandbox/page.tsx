import Simulator from "@/components/sim/Simulator";

export const metadata = {
  title: "آزمایشگاه آزاد انتخابات",
};

export default function SandboxPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-3xl font-extrabold">آزمایشگاه آزاد</h1>
      <p className="mt-3 max-w-2xl leading-8 text-neutral-600 dark:text-neutral-400">
        انتخابات خودتان را بسازید: نامزدها را اضافه یا حذف کنید، گروه‌های
        رأی‌دهنده با ترجیحات دلخواه بسازید (یا رأی‌دهنده به رأی‌دهنده طراحی
        کنید)، صندلی‌ها را چندبرنده کنید و نتیجه را در هر نظام ببینید. هر
        تغییر فوراً بازتاب می‌شود؛ واگرد و ازنو هم در دسترس است.
      </p>
      <div className="mt-8">
        <Simulator />
      </div>
    </div>
  );
}
