export function PlasmaField() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden [mix-blend-mode:screen]">
      <div
        className="animate-plasma-1 absolute -left-[12vmax] -top-[16vmax] h-[62vmax] w-[62vmax] rounded-full opacity-55 blur-[64px]"
        style={{ background: "radial-gradient(closest-side, rgba(29,158,117,.5), transparent 70%)" }}
      />
      <div
        className="animate-plasma-2 absolute -bottom-[15vmax] -right-[14vmax] h-[50vmax] w-[50vmax] rounded-full opacity-55 blur-[64px]"
        style={{ background: "radial-gradient(closest-side, rgba(79,255,176,.32), transparent 70%)" }}
      />
      <div
        className="animate-plasma-3 absolute left-[28%] top-[52%] h-[42vmax] w-[42vmax] rounded-full opacity-55 blur-[64px]"
        style={{ background: "radial-gradient(closest-side, rgba(29,158,117,.3), transparent 70%)" }}
      />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{ background: "radial-gradient(88% 72% at 50% 42%, transparent 40%, rgba(0,0,0,.74) 100%)" }}
      />
    </div>
  );
}
