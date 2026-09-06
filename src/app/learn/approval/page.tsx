import Link from "next/link";
import Simulator from "@/components/sim/Simulator";

export const metadata = {
  title: "رأی تأییدی — آموزش",
};

export default function ApprovalPage() {
  return (
    <article className="mx-auto max-w-6xl px-4 py-12">
      <nav className="mb-6 text-sm">
        <Link href="/learn" className="text-blue-600 hover:underline">
          ← بازگشت به فهرست نظام‌ها
        </Link>
      </nav>

      <h1 className="text-3xl font-extrabold">رأی تأییدی</h1>

      <section className="mt-6 max-w-3xl space-y-4 leading-8 text-neutral-700 dark:text-neutral-300">
        <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
          چگونه کار می‌کند؟
        </h2>
        <p>
          ساده‌ترین «روش کاردینال»: هر رأی‌دهنده به <strong>هر تعداد</strong>
          نامزد که می‌خواهد «تأیید» می‌زند — بدون رتبه، بدون ترتیب. نامزدی که
          بیشترین تأیید را جمع کند برنده است. عملاً مثل برگه‌ای که همهٔ
          نامزدها رویش چک‌باکس دارند.
        </p>
        <p>
          چرا این خانواده؟ قضیهٔ <strong>امکان‌ناپذیری ارو</strong> (۱۹۵۱)
          ثابت می‌کند هیچ نظام رتبه‌ای‌ای نمی‌تواند هم‌زمان چند معیار منصفانهٔ
          طبیعی را برآورده کند. روش‌های کاردینال (تأییدی و امتیازی) از قید
          رتبه بیرون می‌آیند و به همین دلیل از بسیاری از پارادوکس‌های
          رتبه‌ای مصون‌اند.
        </p>

        <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
          ایراد اصلی: رأی گلوله‌ای (Bullet Voting)
        </h2>
        <p>
          در تئوری، رأی تأییدی اجازه می‌دهد هم دلبستگی اول‌تان را بدهید هم
          گزینه‌های قابل‌قبول را تأیید کنید. اما در عمل، اگر رأی‌دهنده باور
          کند تأییدِ رقیب به ضرر نامزد محبوبش است، فقط <strong>یک</strong>
          اسم را تأیید می‌کند — همان رأی گلوله‌ای. وقتی همه این‌طور رأی
          بدهند، رأی تأییدی عملاً به <strong>اکثریت نسبی</strong> فرومی‌پاشد
          و مزیتش (انتخاب گزینهٔ میانهٔ مورد قبول همه) از بین می‌رود.
        </p>
        <p>
          سناریوی آماده را ببینید: همهٔ گروه‌ها فقط یک نامزد تأیید کرده‌اند و
          نتیجه دقیقاً همان اکثریت نسبی است. حالا یک گروه را «صادق» کنید —
          مثلاً به طرفداران آبی اجازه دهید سبزِ میانه‌رو را هم تأیید کنند — و
          ببینید برنده چطور به سمت گزینهٔ پذیرفته‌تر جابه‌جا می‌شود.
        </p>

        <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
          نکات
        </h2>
        <ul className="list-disc space-y-1 ps-6">
          <li>برای رای‌گیری‌های غیرحزبی (هیئت‌مدیره، احزاب داخلی) بسیار رایج است</li>
          <li>برگهٔ ساده و شمارش ساده — از معدود روش‌هایی که بدون کامپیوتر هم سریع است</li>
          <li>نسخهٔ بلوکی (تأییدِ k نامزد، انتخاب k نفر) برای کمیسیون‌ها و هیئت‌ها استفاده می‌شود</li>
          <li>مرز تأیید/رد برای هر رأی‌دهنده جایی است که «به‌اندازهٔ بهترین‌ها دوستش دارد»</li>
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="mb-4 text-2xl font-bold">آزمایش کنید</h2>
        <p className="mb-4 max-w-2xl text-sm leading-7 text-neutral-600 dark:text-neutral-400">
          با سناریوی «رأی گلوله‌ای» شروع کنید و تأییدها را مرحله‌به‌مرحله
          صادقانه‌تر کنید تا سقوط به سمت اکثریت نسبی و برگشت به سمت اجماع را
          تجربه کنید. تعداد صندلی را هم تغییر دهید تا نسخهٔ بلوکی را ببینید.
        </p>
        <Simulator
          initialPreset="approval-bullet"
          presets={["approval-bullet", "default", "spoiler"]}
        />
      </section>
    </article>
  );
}
