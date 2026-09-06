import Link from "next/link";
import LearnSim from "@/components/learn/LearnSim";

export const metadata = {
  title: "رأی امتیازی — آموزش",
};

export default function ScorePage() {
  return (
    <article className="mx-auto max-w-6xl px-4 py-12">
      <nav className="mb-6 text-sm">
        <Link href="/learn" className="text-blue-600 hover:underline">
          ← بازگشت به فهرست نظام‌ها
        </Link>
      </nav>

      <h1 className="text-3xl font-extrabold">رأی امتیازی (Range Voting)</h1>

      <section className="mt-6 max-w-3xl space-y-4 leading-8 text-neutral-700 dark:text-neutral-300">
        <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
          چگونه کار می‌کند؟
        </h2>
        <p>
          به هر نامزد <strong>امتیازی از ۰ تا ۵</strong> می‌دهید — مستقل از
          بقیه، مثل دادن ستاره به رستوران‌ها. جمع امتیازها (یا میانگین)
          برنده را تعیین می‌کند. برخلاف بوردا، امتیازها توصیف‌گر شدتِ نظر
          شماست، نه فقط ترتیب؛ و برخلاف تأییدی، طیف میانی هم دارد (۰ = بی‌اعتماد،
          ۵ = عالی).
        </p>
        <p>
          اگر همه رأی‌های «صادقانه» بدهند، این روش از نظر تئوری داغ‌ترین
          «هزینهٔ اجتماعی» را کمینه می‌کند: جمع رفاه رأی‌دهندگان بیشینه
          می‌شود. از قضا همین شدتِ نظر است که بیشترین تفاوتش با بوردا و
          کندورسه را می‌سازد.
        </p>

        <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
          ایراد اصلی: فروپاشی استراتژیک
        </h2>
        <p>
          در انتخابات واقعی، رأی‌دهندهٔ عقلانی امتیاز میانی نمی‌دهد: فقط
          محبوبش را <strong>۵</strong> و بقیه را <strong>۰</strong> می‌گذارد
          تا حداکثر تفاوت را بسازد. این رفتار (همان رأی گلوله‌ایِ تأییدی،
          ولی شدیدتر) به مرور رأی امتیازی را به «تأییدیِ دوحالته» و بعد به
          اکثریت نسبی نزدیک می‌کند. هرچه جامعه بیشتر تاکتیکی رأی بدهد،
          مزیت اطلاعاتِ شدتِ نظر کمتر می‌شود.
        </p>
        <p>
          یک آزمایش ذهنی: در سناریوی آماده، به‌جای رأی صادق، به هر گروه
          بگویید فقط محبوبش ۵ بگیرد و بقیه ۰ — نتیجه همان اکثریت نسبی می‌شود.
          حالا مقیاس‌ها را نرم کنید (مثلاً محبوب ۵، دوم ۳) و ببینید نتیجهٔ
          میانه‌روتر چطور شکل می‌گیرد.
        </p>

        <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
          نکات
        </h2>
        <ul className="list-disc space-y-1 ps-6">
          <li>در قضاوت‌های عمومی (المپیادها، مسابقات، نقد آثار) سابقهٔ طولانی دارد</li>
          <li>مقیاس عددی مسئله‌ساز است: «۴ یعنی چقدر خوب؟» از شخصی به شخص دیگر فرق دارد</li>
          <li>میانگین یا جمع؟ جمع برای تعداد رأی‌دهندهٔ ثابت همان نتیجهٔ میانگین است</li>
          <li>نسخهٔ بلوکی: جمع امتیاز همهٔ نامزدها، انتخاب k نفر برتر (برای هیئت‌ها)</li>
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="mb-4 text-2xl font-bold">آزمایش کنید</h2>
        <p className="mb-4 max-w-2xl text-sm leading-7 text-neutral-600 dark:text-neutral-400">
          سه اسلایدر دارید: امتیاز طرفداران آبی به هر سه نامزد. امتیاز میانی
          (مثلاً ۳ به سبز) را صفر کنید تا ببینید حذفِ «شدت نظر» چطور برنده را
          از گزینهٔ اجماعی به گزینهٔ قطبی جابه‌جا می‌کند.
        </p>
        <LearnSim system="score" />
      </section>
    </article>
  );
}
