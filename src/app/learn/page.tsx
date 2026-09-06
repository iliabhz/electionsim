import Link from "next/link";
import type { SystemId } from "@/lib/electoral";

const SYSTEMS_META: Array<{
  id: SystemId;
  name: string;
  desc: string;
  ready: boolean;
}> = [
  {
    id: "plurality",
    name: "اکثریت نسبی (FPTP)",
    desc: "هر رأی‌دهنده یک رأی؛ بیشترین رأی برنده است. ساده اما آسیب‌پذیر در برابر اثر شکافنده.",
    ready: true,
  },
  {
    id: "runoff",
    name: "دو مرحله‌ای",
    desc: "اگر اکثریت حاصل نشد، دو نامزد نخست به مرحلهٔ دوم می‌روند. الگوی انتخابات ریاست‌جمهوری فرانسه.",
    ready: true,
  },
  {
    id: "irv",
    name: "انتقال‌پذیر یک‌مرحله‌ای (IRV)",
    desc: "رأی رتبه‌ای؛ کم‌رأی‌ترین نامزد حذف و رأی‌هایش منتقل می‌شود. الگوی ایرلند و استرالیا.",
    ready: true,
  },
  {
    id: "condorcet",
    name: "کندورسه",
    desc: "برندهٔ کسی است که در مقایسهٔ دوبه‌دو همهٔ رقبا را شکست می‌دهد — اگر وجود داشته باشد!",
    ready: true,
  },
  {
    id: "borda",
    name: "شمارش بوردا",
    desc: "رتبه‌ها امتیاز می‌گیرند (N تا ۱) و امتیاز کل تعیین‌کننده است.",
    ready: true,
  },
  {
    id: "approval",
    name: "رأی تأییدی",
    desc: "به هر تعداد نامزد که می‌خواهید «تأیید» می‌زنید؛ بیشترین تأیید برنده است.",
    ready: true,
  },
  {
    id: "score",
    name: "رأی امتیازی",
    desc: "به هر نامزد امتیازی از ۰ تا ۵ می‌دهید؛ جمع امتیازها برنده را مشخص می‌کند.",
    ready: true,
  },
];

export const metadata = {
  title: "آموزش نظام‌های انتخاباتی",
};

export default function LearnIndex() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-3xl font-extrabold">نظام‌های رأی‌گیری</h1>
      <p className="mt-3 max-w-2xl leading-8 text-neutral-600 dark:text-neutral-400">
        هر نظام قواعد خودش را دارد و هر قاعده می‌تواند برنده‌ای متفاوت بسازد.
        برای هر نظام، توضیح، کاربرد واقعی و اشکالات شناخته‌شده را بخوانید و
        همان‌جا آزمایش کنید.
      </p>
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {SYSTEMS_META.map((s) => {
          const inner = (
            <>
              <h2 className="text-lg font-bold">{s.name}</h2>
              <p className="mt-2 flex-1 text-sm leading-7 text-neutral-600 dark:text-neutral-400">
                {s.desc}
              </p>
              <span
                className={`mt-3 inline-block text-sm font-bold ${
                  s.ready ? "text-blue-600 group-hover:underline" : "text-neutral-400"
                }`}
              >
                {s.ready ? "خواندن و آزمایش ←" : "به‌زودی"}
              </span>
            </>
          );
          return s.ready ? (
            <Link
              key={s.id}
              href={`/learn/${s.id}`}
              className="group flex flex-col rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
            >
              {inner}
            </Link>
          ) : (
            <div
              key={s.id}
              aria-disabled
              className="flex flex-col rounded-2xl border border-neutral-200 bg-white p-5 opacity-60 dark:border-neutral-800 dark:bg-neutral-900"
            >
              {inner}
            </div>
          );
        })}
      </div>
    </div>
  );
}
