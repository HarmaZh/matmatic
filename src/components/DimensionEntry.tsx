const WHOLE = Array.from({ length: 60 }, (_, i) => i + 1);
const FRACTIONS: Array<[string, number]> = [
  ['0', 0], ['1/8', 0.125], ['1/4', 0.25], ['3/8', 0.375],
  ['1/2', 0.5], ['5/8', 0.625], ['3/4', 0.75], ['7/8', 0.875],
];

export default function DimensionEntry({ label, value, onChange }: {
  label: string; value: number; onChange: (v: number) => void;
}) {
  const whole = Math.floor(value);
  const frac = +(value - whole).toFixed(4);
  const setWhole = (w: number) => onChange(w + frac);
  const setFrac  = (f: number) => onChange(whole + f);

  return (
    <div>
      <label className="block text-xs uppercase tracking-wider text-graphite mb-2">{label}</label>
      <div className="flex items-center gap-2">
        <select className="h-14 min-w-[72px] rounded-md border border-ink/15 bg-paper px-3 font-serif text-lg tabular-nums focus:outline-none focus:ring-2 focus:ring-pigment"
          value={whole} onChange={(e) => setWhole(+e.target.value)}>
          {WHOLE.map(w => <option key={w} value={w}>{w}</option>)}
        </select>
        <select className="h-14 min-w-[72px] rounded-md border border-ink/15 bg-paper px-3 font-serif text-lg tabular-nums focus:outline-none focus:ring-2 focus:ring-pigment"
          value={frac} onChange={(e) => setFrac(+e.target.value)}>
          {FRACTIONS.map(([lbl, v]) => <option key={lbl} value={v}>{lbl}</option>)}
        </select>
        <span className="text-graphite text-sm">in</span>
      </div>
    </div>
  );
}
