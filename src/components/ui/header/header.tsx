export default function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-white/5 bg-dark/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary ring-1 ring-primary/30">
            <span className="text-xl font-semibold">A</span>
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-neutral">
              AURA
            </p>
            <p className="text-base font-semibold text-white">
              Retinal Vascular Health Screening System
            </p>
            <p className="text-xs text-neutral">
              Hệ Thống Sàng Lọc Sức Khỏe Mạch Máu Võng Mạc
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
