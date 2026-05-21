import { toFractionString } from '../../packages/core/src/math';

export default function DropshipCTA({ result }: { result: { outerW: number; outerH: number } }) {
  const url = `https://www.framebridge.com/start?w=${result.outerW}&h=${result.outerH}`;
  const copyCutList = async () => {
    const text = `Mat outer: ${toFractionString(result.outerW)} × ${toFractionString(result.outerH)}"\nFoam core: same\nGlass: same`;
    await navigator.clipboard.writeText(text);
  };
  return (
    <div className="mt-8 space-y-3">
      <a
        href={url} target="_blank" rel="noopener noreferrer"
        className="block w-full text-center py-4 rounded-md bg-pigment text-paper font-serif text-lg transition-transform active:scale-[0.97]"
      >
        Order this Mat from Framebridge
        <span className="block text-sm font-normal opacity-80 mt-0.5">ships in 5 days</span>
      </a>
      <button onClick={copyCutList} className="block w-full text-center py-2 text-graphite text-sm underline-offset-4 hover:underline">
        or copy cut list →
      </button>
    </div>
  );
}
