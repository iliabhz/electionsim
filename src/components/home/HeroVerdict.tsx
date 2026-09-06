const PROFILE = [
  { color: '#3b82f6', name: 'آبی', count: '۳۵' },
  { color: '#22c55e', name: 'سبز', count: '۳۳' },
  { color: '#f97316', name: 'نارنجی', count: '۳۲' },
];

const VERDICTS = [
  {
    system: 'اکثریت نسبی',
    winner: 'آبی',
    color: '#3b82f6',
    note: '۳۵ رأی — فقط رأی اول شمرده می‌شود',
    accent: 'ring-blue-500/40',
    glow: 'bg-blue-500/20',
  },
  {
    system: 'انتقال‌پذیر (IRV)',
    winner: 'سبز',
    color: '#22c55e',
    note: 'نارنجی حذف شد و رأی‌هایش سبز را پیروز کرد',
    accent: 'ring-emerald-500/40',
    glow: 'bg-emerald-500/20',
  },
  {
    system: 'کندورسه (دوبه‌دو)',
    winner: 'نارنجی',
    color: '#f97316',
    note: 'در هر مقایسهٔ یک‌به‌یک همهٔ حریفان را می‌برد!',
    accent: 'ring-orange-500/40',
    glow: 'bg-orange-500/20',
  },
];

export default function HeroVerdict() {
  return (
    <div className="relative animate-float" aria-hidden>
      <div className="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-tr from-blue-600/20 via-violet-600/10 to-transparent blur-2xl" />
      <div className="relative space-y-4 rounded-3xl border border-neutral-800 bg-neutral-900/80 p-6 shadow-2xl backdrop-blur">
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold text-neutral-300">
            همین انتخابات، سه نتیجه
          </p>
          <span className="rounded-full bg-neutral-800 px-3 py-1 text-xs text-neutral-400">
            ۱۰۰ رأی‌دهنده
          </span>
        </div>

        <ul className="grid grid-cols-3 gap-2 rounded-2xl bg-neutral-950/60 p-3">
          {PROFILE.map((p) => (
            <li key={p.name} className="text-center">
              <span
                className="mx-auto block h-2.5 w-2.5 rounded-full"
                style={{ background: p.color }}
              />
              <span className="mt-1 block text-xs text-neutral-400">
                {p.name}
              </span>
              <span className="block text-sm font-extrabold text-neutral-100">
                {p.count}
              </span>
            </li>
          ))}
        </ul>

        <div className="space-y-3">
          {VERDICTS.map((v, i) => (
            <div
              key={v.system}
              className={`flex items-center gap-3 rounded-2xl bg-neutral-950/70 p-3 ring-1 ${v.accent}`}
              style={{ transform: `translateX(${i * -10}px)` }}
            >
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg font-black text-white ${v.glow}`}
                style={{ background: `${v.color}33`, color: v.color }}
              >
                {i + 1}
              </span>
              <div className="min-w-0">
                <p className="text-xs text-neutral-400">{v.system}</p>
                <p
                  className="text-sm font-extrabold"
                  style={{ color: v.color }}
                >
                  برنده: {v.winner}
                </p>
                <p className="truncate text-[11px] text-neutral-500">
                  {v.note}
                </p>
              </div>
            </div>
          ))}
        </div>

        <p className="pt-1 text-center text-xs text-neutral-500">
          همان رأی‌ها — سه قاعدهٔ شمارش متفاوت
        </p>
      </div>
    </div>
  );
}
