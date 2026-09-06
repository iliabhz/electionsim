import Link from "next/link";
import HeroVerdict from "@/components/home/HeroVerdict";
import Reveal from "@/components/home/Reveal";

const SYSTEM_TILES: Array<{
  href: string;
  name: string;
  hook: string;
  color: string;
}> = [
  {
    href: "/learn/plurality",
    name: "اکثریت نسبی",
    hook: "برنده با ۳۵٪ رأی — و رأی حریفِ شکافته",
    color: "#3b82f6",
  },
  {
    href: "/learn/runoff",
    name: "دو مرحله‌ای",
    hook: "میانه‌رو حذف شد؛ افراطی‌ها به دور دوم رسیدند",
    color: "#06b6d4",
  },
  {
    href: "/learn/irv",
    name: "انتقال‌پذیر (IRV)",
    hook: "برندهٔ واقعی، اولِ همه حذف شد",
    color: "#8b5cf6",
  },
  {
    href: "/learn/condorcet",
    name: "کندورسه",
    hook: "سنگ، کاغذ، قیچی — روی صندلی رأی",
    color: "#f59e0b",
  },
  {
    href: "/learn/borda",
    name: "شمارش بوردا",
    hook: "رأی دوم‌تان هم می‌شمارد",
    color: "#ec4899",
  },
  {
    href: "/learn/approval",
    name: "رأی تأییدی",
    hook: "هرکس را قبول دارید، تأیید کنید",
    color: "#10b981",
  },
  {
    href: "/learn/score",
    name: "رأی امتیازی",
    hook: "از ۰ تا ۵ نمره بدهید؛ شدت نظر مهم است",
    color: "#f97316",
  },
];

export default function Home() {
  return (
    <div className="bg-neutral-950 text-neutral-100">
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:44px_44px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 start-1/4 h-96 w-96 rounded-full bg-blue-600/25 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-24 end-0 h-80 w-80 rounded-full bg-violet-600/20 blur-3xl"
        />

        <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-4 py-20 lg:grid-cols-2 lg:py-28">
          <div className="animate-fade-up">
            <span className="inline-block rounded-full border border-neutral-700 bg-neutral-900 px-4 py-1.5 text-xs font-bold text-neutral-300">
              آزمایشگاه تعاملی نظام‌های رأی‌گیری
            </span>
            <h1 className="mt-6 text-5xl font-black leading-[1.15] tracking-tight sm:text-6xl">
              یک انتخابات،{" "}
              <span className="bg-gradient-to-l from-blue-400 via-violet-400 to-pink-400 bg-clip-text text-transparent">
                سه برنده
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-9 text-neutral-400">
              همان رأی‌ها، سه قاعدهٔ شمارش، سه نتیجهٔ متفاوت. این‌جا یاد
              می‌گیرید قواعد رأی‌گیری چطور برنده می‌سازند و پارادوکس‌های
              مشهور ریاضی انتخابات را با دست خودتان بازتولید می‌کنید.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                href="/learn"
                className="rounded-xl bg-gradient-to-l from-blue-600 to-violet-600 px-7 py-3.5 font-bold text-white shadow-lg shadow-blue-900/40 transition-transform hover:scale-[1.03]"
              >
                شروع یادگیری
              </Link>
            </div>
            <dl className="mt-10 flex gap-8 text-sm">
              {[
                ["۷", "نظام رأی‌گیری"],
                ["۱۹", "آزمایش گام‌به‌گام"],
                ["۱۰۰٪", "رایگان و بدون ثبت‌نام"],
              ].map(([num, label]) => (
                <div key={label}>
                  <dt className="sr-only">{label}</dt>
                  <dd className="text-2xl font-black text-neutral-100">
                    {num}
                  </dd>
                  <dd className="text-neutral-500">{label}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="animate-fade-up" style={{ animationDelay: "150ms" }}>
            <HeroVerdict />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-24">
        <Reveal>
          <h2 className="text-2xl font-black">از کجا شروع کنیم؟</h2>
          <p className="mt-2 text-sm leading-7 text-neutral-400">
            هر نظام یک صفحهٔ آموزشی با مینی‌شبیه‌ساز زنده دارد؛ فقط چند اهرم
            جابه‌جا کنید تا ایدهٔ اصلی را ببینید.
          </p>
        </Reveal>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SYSTEM_TILES.map((tile, i) => (
            <Reveal key={tile.href} delay={60 + i * 40}>
              <Link
                href={tile.href}
                className="group flex h-full flex-col rounded-3xl border border-neutral-800 bg-neutral-900/70 p-5 transition-all hover:-translate-y-1 hover:border-neutral-600"
                style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)" }}
              >
                <span
                  className="mb-3 inline-block h-2.5 w-10 rounded-full"
                  style={{ background: tile.color }}
                />
                <h3 className="font-black">{tile.name}</h3>
                <p className="mt-2 flex-1 text-sm leading-7 text-neutral-400">
                  {tile.hook}
                </p>
                <span
                  className="mt-3 text-sm font-bold opacity-0 transition-opacity group-hover:opacity-100"
                  style={{ color: tile.color }}
                >
                  امتحانش کن ←
                </span>
              </Link>
            </Reveal>
          ))}

          <Reveal className="sm:col-span-2" delay={340}>
            <div className="flex h-full min-h-32 flex-col justify-center rounded-3xl border border-dashed border-neutral-700 bg-neutral-900/40 p-6">
              <p className="text-sm leading-7 text-neutral-400">
                <span className="font-black text-neutral-200">
                  هیچ نظامی کامل نیست.
                </span>{" "}
                قضیهٔ امکان‌ناپذیری ارو ثابت می‌کند هر قاعدهٔ رأی‌گیری جای
                چیزی را با چیزی دیگر معامله می‌کند — در هر صفحهٔ آموزشی،
                معاملهٔ آن نظام را دقیق نشان می‌دهیم.
              </p>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
