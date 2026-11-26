export default function GlobalLoading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <div className="w-10 h-10 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-xs font-mono tracking-widest text-zinc-500 uppercase">
        LOADING RORE CLUB...
      </p>
    </div>
  );
}
