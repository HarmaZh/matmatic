export default function AsymmetricToggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-xs uppercase tracking-wider text-graphite">Border style</span>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className="relative inline-flex h-9 w-44 items-center rounded-full bg-ink/5 p-1 text-sm transition-transform active:scale-[0.97]"
        aria-pressed={value}
      >
        <span className={`absolute h-7 w-[88px] rounded-full bg-paper shadow-sm transition-transform duration-200 ${value ? 'translate-x-[80px]' : 'translate-x-0'}`} />
        <span className={`relative flex-1 text-center ${!value ? 'text-ink font-medium' : 'text-graphite'}`}>Symmetric</span>
        <span className={`relative flex-1 text-center ${value ? 'text-ink font-medium' : 'text-graphite'}`}>Asymmetric</span>
      </button>
    </div>
  );
}
