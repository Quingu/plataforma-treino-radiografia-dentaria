import React from 'react';

export default function ModalTermos({ aoFechar }) {
  return (
    /* Fundo escuro semitransparente que cobre a tela toda */
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm select-none">
      
      {/* Container do Modal */}
      <div className="bg-[#101927] border border-slate-700/80 rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Cabeçalho do Modal */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📜</span>
            <h2 className="text-xl font-bold text-white tracking-tight">Termos, Privacidade & Cookies</h2>
          </div>
          <button 
            onClick={aoFechar}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer p-1"
            title="Fechar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Conteúdo com scroll (Rolagem) */}
        <div className="p-6 overflow-y-auto text-sm text-slate-300 space-y-6 leading-relaxed">
          
          <p className="text-slate-400 italic">
            Última atualização: Agosto de 2026<br/>
            O <strong>RadioDent</strong> é uma plataforma acadêmica voltada ao treino e diagnóstico radiográfico odontológico. Ao utilizar nosso sistema, você concorda com os termos e práticas descritos abaixo.
          </p>

          <section>
            <h3 className="text-blue-400 font-semibold mb-2 text-base">1. Coleta e Tratamento de Dados Pessoais</h3>
            <p className="mb-2">Coletamos apenas as informações estritamente necessárias para a prestação dos serviços e gestão da plataforma acadêmica:</p>
            <ul className="list-disc pl-5 space-y-1 text-slate-400">
              <li><strong>Dados de Cadastro:</strong> Nome completo, endereço de e-mail (institucional para professores) e senha criptografada.</li>
              <li><strong>Perfil de Acesso:</strong> Identificação da categoria de usuário (Aluno ou Professor) para personalização do ambiente de ensino.</li>
              <li><strong>Dados de Uso Acadêmico:</strong> Histórico de simulações, laudos submetidos, pontuações e desempenho.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-blue-400 font-semibold mb-2 text-base">2. Finalidade do Uso das Informações</h3>
            <p className="mb-2">Os dados coletados são utilizados exclusivamente para:</p>
            <ul className="list-disc pl-5 space-y-1 text-slate-400">
              <li>Permitir a autenticação e acesso seguro à plataforma.</li>
              <li>Oferecer relatórios de desempenho e acompanhamento pedagógico.</li>
              <li>Garantir a integridade do sistema e prevenir acessos não autorizados.</li>
            </ul>
            <p className="mt-2 text-xs text-slate-500">*O RadioDent não comercializa e não compartilha dados pessoais com terceiros para fins publicitários.</p>
          </section>

          <section>
            <h3 className="text-blue-400 font-semibold mb-2 text-base">3. Política de Cookies e Armazenamento Local</h3>
            <p className="mb-2">O RadioDent utiliza Cookies e Armazenamento Local (localStorage) estritamente funcionais:</p>
            <ul className="list-disc pl-5 space-y-1 text-slate-400">
              <li><strong>Autenticação:</strong> Manter sua sessão ativa de forma segura enquanto navega entre as telas.</li>
              <li><strong>Preferências:</strong> Lembrar dados temporários de navegação para evitar recarregamentos.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-blue-400 font-semibold mb-2 text-base">4. Direitos do Usuário (LGPD - Lei nº 13.709/2018)</h3>
            <p className="mb-2">Como titular dos dados, você tem direito a:</p>
            <ul className="list-disc pl-5 space-y-1 text-slate-400">
              <li><strong>Acesso e Correção:</strong> Visualizar e atualizar seus dados diretamente na plataforma.</li>
              <li><strong>Portabilidade e Exclusão:</strong> Solicitar o encerramento da conta e a eliminação dos dados.</li>
              <li><strong>Transparência:</strong> Saber exatamente como suas informações são tratadas.</li>
            </ul>
          </section>

        </div>

        {/* Rodapé do Modal */}
        <div className="p-5 border-t border-slate-800 flex justify-end bg-[#0d131d] rounded-b-2xl">
          <button 
            onClick={aoFechar}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-sm transition-colors cursor-pointer active:scale-[0.98]"
          >
            Entendi
          </button>
        </div>

      </div>
    </div>
  );
}