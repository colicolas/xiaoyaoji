import AuthButton from "@/components/AuthButton";

export default function Home() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-t from-cloud-white via-[#EAF7FB] to-[#DDECF8]">
      {/* soft grain */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.10] bg-noise" />

      {/* animated atmosphere blobs */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-[28rem] w-[28rem] rounded-full bg-sky-cyan/45 blur-[110px] animate-drift1" />
      <div className="pointer-events-none absolute -bottom-32 -right-28 h-[32rem] w-[32rem] rounded-full bg-fish-belly/55 blur-[130px] animate-drift2" />
      <div className="pointer-events-none absolute top-[20%] right-[-6rem] h-[22rem] w-[22rem] rounded-full bg-jade/25 blur-[120px] animate-drift3" />

      {/* bubbles */}
      <div className="pointer-events-none absolute left-[12%] top-[22%] h-2.5 w-2.5 rounded-full bg-white/70 blur-[0.5px] animate-bubble1" />
      <div className="pointer-events-none absolute left-[22%] top-[68%] h-2 w-2 rounded-full bg-white/55 blur-[0.5px] animate-bubble2" />
      <div className="pointer-events-none absolute right-[20%] top-[30%] h-2.5 w-2.5 rounded-full bg-white/60 blur-[0.5px] animate-bubble3" />

      {/* content */}
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-5xl items-center justify-center px-6 py-14">
        {/* gradient border frame */}
        <div className="w-full max-w-[820px] rounded-[44px] bg-gradient-to-b from-white/80 via-white/35 to-white/20 p-[1.2px] shadow-[0_18px_70px_rgba(27,60,89,0.14)]">
          {/* glass card */}
          <div className="relative overflow-hidden rounded-[44px] bg-white/35 backdrop-blur-xl">
            {/* inner glow */}
            <div className="pointer-events-none absolute -top-24 left-1/2 h-64 w-[46rem] -translate-x-1/2 rounded-full bg-white/60 blur-3xl opacity-70" />
            <div className="pointer-events-none absolute inset-0 rounded-[44px] ring-1 ring-white/40" />

            <div className="relative flex flex-col items-center px-10 py-12 text-center">
              {/* whale + twinkle */}
              <div className="relative mb-6">
                <div className="pointer-events-none absolute inset-0 -z-10 rounded-full bg-sky-cyan/55 blur-2xl scale-110 animate-softpulse" />
                <div className="select-none text-[6.6rem] leading-none drop-shadow-sm animate-floaty">
                  🐳
                </div>

                {/* twinkles */}
                <span className="pointer-events-none absolute -left-6 top-3 text-beiming/80 animate-twinkle">
                  ✦
                </span>
                <span className="pointer-events-none absolute -right-4 top-10 text-beiming/50 animate-twinkle2">
                  ✦
                </span>
              </div>

              <h1 className="font-zcool text-[4.2rem] leading-none tracking-[0.22em] text-beiming drop-shadow-sm">
                逍遥记
              </h1>

              <div className="mt-6 space-y-2 text-beiming/70">
                <p className="text-lg font-medium tracking-wide">
                  "北冥有鱼，其名为鲲"
                </p>
                <p className="text-sm opacity-70">
                  记录你的每一次化鹏时刻 <span className="align-middle">☁️</span>
                </p>
              </div>

              {/* thin elegant divider */}
              <div className="mt-8 h-px w-[68%] bg-gradient-to-r from-transparent via-beiming/15 to-transparent" />

              {/* auth area - NO WHITE BOX */}
              <div className="mt-8 w-full max-w-md">
                <AuthButton />

                <p className="mt-4 text-xs text-beiming/55">
                  小提示：今天也可以很轻盈。
                </p>
              </div>
            </div>

            {/* footer strip */}
            <div className="px-10 pb-8 text-center text-xs text-beiming/45">
              Xiaoyaoji · 逍遥而行，心有北冥
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
