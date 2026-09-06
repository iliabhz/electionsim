import Link from "next/link";
import LearnSim from "@/components/learn/LearnSim";

export const metadata = {
  title: "شمارش بوردا — آموزش",
};

export default function BordaPage() {
  return (
    <article className="mx-auto max-w-6xl px-4 py-12">
      <nav className="mb-6 text-sm">
        <Link href="/learn" className="text-blue-600 hover:underline">
          ← بازگشت به فهرست نظام‌ها
        </Link>
      </nav>

      <h1 className="text-3xl font-extrabold">شمارش بوردا</h1>

      <section className="mt-6 max-w-3xl space-y-4 leading-8 text-neutral-700 dark:text-neutral-300">
        <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
          چگونه کار می‌کند؟
        </h2>
        <p>
          ژان-شارل دو بوردا (قرن هجدهم) پیشنهاد کرد به‌جای شمردن فقط رأی اول،
          به <strong>همهٔ رتبه‌ها امتیاز</strong> بدهیم: با n نامزد، اول هر
          برگه n امتیاز، دوم n−۱، … و آخر ۱ امتیاز می‌گیرد. نامزدی که جمع
          امتیاز بیشتری دارد برنده است. در اینجا اگر نامزدی رتبه‌بندی نشود،
          فقط ۱ امتیاز (کمترین) می‌گیرد.
        </p>
        <p>
          فلسفهٔ روش: نه فقط «چه کسی اول آمد»، بلکه «بقیه چطور دیدنش» هم
          مهم است — نامزدی که دومِ همه باشد می‌تواند برنده شود، چیزی که در
          اکثریت نسبی هرگز ممکن نیست.
        </p>

        <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
          ایراد اصلی: رأی استراتژیک و «دفن رقیب»
        </h2>
        <p>
          بوردا به شدت در برابر رأی‌دهندهٔ تاکتیکی آسیب‌پذیر است. اگر
          طرفدارِ نامزد A بداند رقیب اصلی‌اش B است، به‌جای رتبهٔ واقعی «
          B دوم»، او را <strong>به آخرین رتبه می‌فرستد</strong> (دفن/burying)
          تا امتیازش کم شود، حتی اگر B را واقعاً از بقیه بهتر بداند.
        </p>
        <p>
          عددی ببینید: ۵۱ نفر «آبی &gt; سبز &gt; نارنجی» و ۴۹ نفر «سبز &gt;
          آبی &gt; نارنجی» رأی می‌دهند. رأی صادق: آبی ۲۵۱ در برابر سبز ۲۴۹ —
          آبی می‌برد. حالا طرفداران سبز به‌جای رتبهٔ واقعی، آبی را دفن می‌کنند
          («سبز &gt; نارنجی &gt; آبی»): سبز ۲۴۹، آبی ۲۰۲ — سبز می‌برد! گیر
          کار در این است که طرفداران آبی هم می‌توانستند همین کار را بکنند؛
          نتیجه به «چه کسی زودتر تاکتیکی رأی داد» وابسته است.
        </p>

        <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
          سایر اشکالات
        </h2>
        <ul className="list-disc space-y-1 ps-6">
          <li>برندهٔ بوردا ممکن است در مقایسهٔ دوبه‌دو از چند رقیب ببازد (برندهٔ کندورسه نیست)</li>
          <li>افزودن یک نامزد بی‌اهمیت می‌تواند برنده را عوض کند (ناهنجاری نامزد نو)</li>
          <li>حزب‌ها انگیزهٔ «نامزدسازی انبوه» پیدا می‌کنند تا امتیازهای حریف پراکنده شود</li>
          <li>برخورد با برگه‌های ناقص باید قاعدهٔ صریح داشته باشد (اینجا: امتیاز حداقل)</li>
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="mb-4 text-2xl font-bold">آزمایش کنید</h2>
        <p className="mb-4 max-w-2xl text-sm leading-7 text-neutral-600 dark:text-neutral-400">
          یک کلید دارید: رأی سبزی‌ها صادق باشد یا آبی را «دفن» کنند. کلید را
          بزنید و جهش امتیازها را در نمودار ببینید — بدون اینکه حتی یک رأی
          واقعی اضافه یا کم شود.
        </p>
        <LearnSim system="borda" />
      </section>
    </article>
  );
}
