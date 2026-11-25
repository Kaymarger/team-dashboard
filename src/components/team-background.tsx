export function TeamBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 bg-[#f4f2ee]">
      <div className="absolute -top-40 right-[-6rem] h-80 w-80 rounded-full bg-[#efe4d4] blur-3xl" />
      <div className="absolute top-1/3 -left-24 h-64 w-64 rounded-full bg-[#f7f1e8] blur-3xl" />
    </div>
  );
}
