export function TeamBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 bg-[#2b2f3e]"
      style={{
        backgroundImage:
          "radial-gradient(900px 420px at 0% 0%, rgba(212,180,131,0.08), transparent 55%), linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
        backgroundSize: "auto, 56px 56px, 56px 56px",
      }}
    />
  );
}