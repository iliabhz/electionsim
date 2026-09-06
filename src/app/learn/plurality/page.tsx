import Link from "next/link";
import Simulator from "@/components/sim/Simulator";

export const metadata = {
  title: "اکثریت نسبی (FPTP) — آموزش",
};

export default function PluralityPage() {
  return (
    <article className="mx-auto max-w-6xl px-4 py-12">
      <nav className="mb-6 text-sm">
        <Link href="/learn" className="text-blue-600 hover:underline">
          ← بازگشت به فهرست نظام‌ها
        </Link>
      </nav>

      <h1 className="text-3xl font-extrabold">
        اکثریت نسبی (اول‌شدن — First Past The Post)
      </h1>

      <section className="prose-sm mt-6 max-w-3xl space-y-4 leading-8 text-neutral-700 dark:text-neutral-300">
        <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
          چگونه کار می‌کند؟
        </h2>
        <p>
          ساده‌ترین نظام ممکن: هر رأی‌دهنده یک نامزد را روی برگه علامت می‌زند و
          نامزدی که <strong>بیشترین</strong> رأی را آورد برنده است — حتی اگر
          کمتر از نیمی از رأی‌ها باشد. «اکثریت نسبی» یعنی همین: لازم نیست بیش
          از ۵۰٪ رأی بیاورید؛ کافی است از بقیه جلوتر باشید.
        </p>

        <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
          کجا استفاده می‌شود؟
        </h2>
        <p>
          انتخابات کنگره و سنای آمریکا، مجلس عوام بریتانیا، و بسیاری از
          انتخابات‌های محلی در کشورهای انگلوساکسون. قدیمی‌ترین و رایج‌ترین
          نظام تک‌برنده در جهان است.
        </p>

        <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
          ایراد اصلی: اثر شکافنده (Spoiler Effect)
        </h2>
        <p>
          وقتی دو نامزد <strong>نزدیک به هم</strong> از یک جناح وارد می‌شوند،
          رأی‌شان تقسیم می‌شود و نامزد سوم (که شاید کمتر از هر دو محبوب باشد)
          از وسط عبور می‌کند. مثال معروف: سال ۲۰۰۰ در فلوریدا، رأی‌دهندگان
          رالف نادر عمدتاً ال گور را به بوش ترجیح می‌دادند؛ همین چند هزار رأی
          تقسیم‌شده سرنوشت کل انتخابات ریاست‌جمهوری را عوض کرد.
        </p>
        <p>
          عددی ببینید: در سناریوی آمادهٔ پایین، نامزد «آبی» با ۳۰ رأی و نامزد
          «بنفش» (مشابه آبی) با ۱۰ رأی در مجموع ۴۰ طرفدار دارند — بیشتر از
          «سبز» با ۳۵ رأی. اما در مقایسهٔ دوبه‌دو، آبی سبز را ۵۵ به ۴۵
          شکست می‌دهد. با این حال <strong>سبز</strong> برندهٔ انتخابات می‌شود،
          چون رأی طرفداران آبی و بنفش «شکافته» شده است.
        </p>

        <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
          پیامدها
        </h2>
        <ul className="list-disc space-y-1 ps-6">
          <li>رأی به نامزد سوم «هدررفته» تلقی می‌شود و رأی‌دهندگان تاکتیکی رأی می‌دهند</li>
          <li>سیستم به‌طور طبیعی به دو حزب بزرگ میل می‌کند (قانون دوورژه)</li>
          <li>نمایندهٔ حوزه ممکن است با رأی اکثریتِ منطقه انتخاب نشود</li>
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="mb-4 text-2xl font-bold">آزمایش کنید</h2>
        <p className="mb-4 max-w-2xl text-sm leading-7 text-neutral-600 dark:text-neutral-400">
          با اسلایدر تعداد رأی‌دهندگان هر گروه بازی کنید: چند رأی دیگر به
          «بنفش» بدهید یا از «آبی» بگیرید و ببینید برنده چطور عوض می‌شود. با
          کلید صندلی، نسخهٔ چندبرنده (هر رأی‌دهنده تا k نامزد را انتخاب
          می‌کند) را هم امتحان کنید.
        </p>
        <Simulator
          initialPreset="spoiler"
          presets={["default", "spoiler", "majority-sweep"]}
        />
      </section>
    </article>
  );
}
