import Link from "next/link";

const FEATURES = [
  {
    icon: "📚",
    title: "آموزش گام‌به‌گام",
    text: "هفت نظام رأی‌گیری با زبان ساده، مثال‌های واقعی و نقاط ضعف هرکدام",
    href: "/learn",
    cta: "شروع یادگیری",
  },
  {
    icon: "🧪",
    title: "آزمایش تعاملی",
    text: "با اسلایدرها و نمودارها ببینید چطور تغییر رأی‌ها نتیجه را وارونه می‌کند",
    href: "/learn/plurality",
    cta: "اثر شکافنده را ببینید",
  },
  {
    icon: "🗳️",
    title: "آزمایشگاه آزاد",
    text: "انتخابات خودتان را طراحی کنید و هم‌زمان در همهٔ نظام‌ها مقایسه کنید",
    href: "/sandbox",
    cta: "رفتن به شبیه‌ساز",
  },
];

export default function Home() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <section className="text-center">
        <h1 className="mx-auto max-w-3xl text-4xl font-extrabold leading-snug sm:text-5xl">
          آیا برندهٔ انتخابات، محبوب‌ترین گزینه است؟
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-neutral-600 dark:text-neutral-400">
          بستگی دارد به نظام رأی‌گیری! در این آزمایشگاه، نظام‌های انتخاباتی را
          یاد می‌گیرید، پارادوکس‌های مشهور را با دست خودتان بازتولید می‌کنید و
          انتخابات دلخواهتان را شبیه‌سازی می‌کنید.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link
            href="/learn"
            className="rounded-xl bg-blue-600 px-6 py-3 font-bold text-white shadow hover:bg-blue-700"
          >
            شروع کنیم
          </Link>
          <Link
            href="/sandbox"
            className="rounded-xl border border-neutral-300 bg-white px-6 py-3 font-bold hover:border-blue-500 hover:text-blue-600 dark:border-neutral-700 dark:bg-neutral-900"
          >
            آزمایشگاه آزاد
          </Link>
        </div>
      </section>

      <section className="mt-16 grid gap-6 md:grid-cols-3">
        {FEATURES.map((f) => (
          <Link
            key={f.title}
            href={f.href}
            className="group rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
          >
            <span className="text-3xl">{f.icon}</span>
            <h2 className="mt-3 text-lg font-bold">{f.title}</h2>
            <p className="mt-2 text-sm leading-7 text-neutral-600 dark:text-neutral-400">
              {f.text}
            </p>
            <span className="mt-3 inline-block text-sm font-bold text-blue-600 group-hover:underline">
              {f.cta} ←
            </span>
          </Link>
        ))}
      </section>
    </div>
  );
}
