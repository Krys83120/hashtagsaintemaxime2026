export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="text-4xl text-sm-cyan animate-pulse">#</div>
        <div className="text-sm text-sm-gray">Chargement...</div>
      </div>
    </div>
  );
}
