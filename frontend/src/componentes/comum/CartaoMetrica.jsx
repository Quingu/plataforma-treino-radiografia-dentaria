export default function CartaoMetrica({ titulo, valor, descricao }) {
  return (
    <article className="bg-[#111c2c] border border-slate-700/80 rounded-2xl p-5">
      <p className="text-xs text-slate-400">{titulo}</p>
      <p className="mt-2 text-3xl font-bold text-white">{valor}</p>
      <p className="mt-2 text-xs text-slate-500">{descricao}</p>
    </article>
  );
}