export function GridFloor() {
  return (
    <div
      aria-hidden
      className="animate-grid-move pointer-events-none absolute -inset-1/2 opacity-[0.09]"
      style={{
        backgroundImage:
          "linear-gradient(rgba(79,255,176,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(79,255,176,.6) 1px, transparent 1px)",
        backgroundSize: "48px 48px",
        transform: "perspective(440px) rotateX(60deg)",
        WebkitMaskImage: "radial-gradient(62% 62% at 50% 38%, #000 8%, transparent 76%)",
        maskImage: "radial-gradient(62% 62% at 50% 38%, #000 8%, transparent 76%)",
      }}
    />
  );
}
