export function TeamBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[#0e1a2b]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_15%_0%,_rgba(41,76,125,0.55),_transparent_52%),radial-gradient(ellipse_at_90%_10%,_rgba(92,92,92,0.25),_transparent_46%),linear-gradient(165deg,_#0e1a2b_0%,_#13243b_48%,_#0e1a2b_100%)]" />
      <div className="orb-a absolute -top-[12%] -left-[8%] h-[46vmin] w-[46vmin] rounded-full bg-[radial-gradient(circle,_rgba(41,76,125,0.55)_0%,_transparent_68%)] blur-3xl" />
      <div className="orb-b absolute -right-[12%] bottom-[-10%] h-[50vmin] w-[50vmin] rounded-full bg-[radial-gradient(circle,_rgba(41,76,125,0.35)_0%,_transparent_70%)] blur-3xl" />
    </div>
  );
}
