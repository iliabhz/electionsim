import type { Metadata } from "next";
import { Vazirmatn } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const vazir = Vazirmatn({
  variable: "--font-vazir",
  subsets: ["arabic", "latin"],
});

export const metadata: Metadata = {
  title: "آزمایشگاه نظام‌های انتخاباتی",
  description:
    "آموزش تعاملی نظام‌های رأی‌گیری: اکثریت نسبی، دو مرحله‌ای، IRV، کندورسه، بوردا، رأی تأییدی و امتیازی — همراه با شبیه‌ساز انتخابات",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fa"
      dir="rtl"
      className={`${vazir.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-blue-600 focus:px-4 focus:py-2 focus:text-white"
        >
          پرش به محتوای اصلی
        </a>
        <header className="border-b border-neutral-200 bg-white/80 backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/80">
          <nav className="mx-auto flex max-w-6xl items-center gap-8 px-4 py-3">
            <Link href="/" className="text-lg font-bold">
              🗳️ آزمایشگاه انتخابات
            </Link>
            <div className="flex gap-5 text-sm font-medium">
              <Link href="/learn" className="hover:text-blue-600">
                آموزش
              </Link>
              <Link href="/sandbox" className="hover:text-blue-600">
                آزمایشگاه آزاد
              </Link>
              <Link href="/compare" className="hover:text-blue-600">
                مقایسهٔ نظام‌ها
              </Link>
            </div>
          </nav>
        </header>
        <main id="main" className="flex-1">{children}</main>
        <footer className="border-t border-neutral-200 py-6 text-center text-sm text-neutral-500 dark:border-neutral-800">
          آزمایشگاه تعاملی نظام‌های انتخاباتی — ساخته‌شده برای آموزش
        </footer>
      </body>
    </html>
  );
}
