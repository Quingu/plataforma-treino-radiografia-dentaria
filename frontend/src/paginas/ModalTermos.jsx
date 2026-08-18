import React from 'react';

/**
 * ModalTermos
 * @param {function} aoFechar - Função para fechar o modal.
 * @param {function} [aoAceitar] - (Opcional) Função disparada quando o usuário aceita os termos ativamente no cadastro/login (RN-02).
 * @param {boolean} [modoAceite=false] - Se true, exibe os botões de Aceitar/Recusar. Se false, exibe apenas botão "Fechar".
 */
export default function ModalTermos({ aoFechar, aoAceitar, modoAceite = false }) {

  const lidarComAceite = () => {
    if (aoAceitar) {
      aoAceitar({
        aceito: true,
        dataConsentimento: new Date().toISOString(),
        versaoTermos: '1.0'
      });
    }
    aoFechar();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm select-none animate-fade-in">
      
      <div className="bg-[#101927] border border-slate-700/80 rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* CABEÇALHO DO MODAL */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Termos de Uso & Privacidade</h2>
            <p className="text-xs text-slate-400">Conformidade LGPD (Lei nº 13.709/2018)</p>
          </div>
          
          <button 
            onClick={aoFechar}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer p-1 rounded-lg hover:bg-slate-800"
            title="Fechar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* CONTEÚDO DO MODAL */}
        <div className="p-6 overflow-y-auto text-sm text-slate-300 space-y-6 leading-relaxed custom-scrollbar">
          
          <p className="text-slate-400 italic text-xs border-l-2 border-blue-500 pl-3 py-1">
            Última atualização: Agosto de 2026<br/>
            O <strong>RadioDent</strong> é uma plataforma acadêmica voltada ao treino e diagnóstico radiográfico odontológico. A navegação no sistema requer o consentimento explícito dos termos abaixo (RN-02).
          </p>

          <section>
            <h3 className="text-blue-400 font-semibold mb-2 text-base">1. Coleta e Tratamento de Dados Pessoais</h3>
            <p className="mb-2">Coletamos apenas as informações estritamente necessárias para a prestação dos serviços e gestão da plataforma acadêmica (Minimização de Dados - RN-04):</p>
            <ul className="list-disc pl-5 space-y-1 text-slate-400">
              <li><strong>Dados de Cadastro:</strong> Nome completo, endereço de e-mail e senha armazenada de forma criptografada.</li>
              <li><strong>Perfil de Acesso (RBAC):</strong> Classificação entre <em>Professor</em> e <em>Aluno</em> para controle rigoroso de permissões.</li>
              <li><strong>Dados de Desempenho Acadêmico:</strong> Histórico de exercícios, laudos submetidos, pontuações e interações nas simulações.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-blue-400 font-semibold mb-2 text-base">2. Finalidade e Proteção de Dados de Saúde</h3>
            <p className="mb-2">Os dados coletados são utilizados exclusivamente para as seguintes finalidades:</p>
            <ul className="list-disc pl-5 space-y-1 text-slate-400">
              <li>Autenticação segura e prevenção contra acessos não autorizados.</li>
              <li>Acompanhamento pedagógico e geração de relatórios de desempenho.</li>
              <li><strong>Anonimização Radiográfica:</strong> Todas as imagens clínicas disponibilizadas para treino passam por um processo rigoroso de desidentificação de dados de pacientes.</li>
            </ul>
            <p className="mt-2 text-xs text-slate-500">*O RadioDent não comercializa e não compartilha dados com terceiros sob nenhuma hipótese.</p>
          </section>

          <section>
            <h3 className="text-blue-400 font-semibold mb-2 text-base">3. Cookies e Armazenamento Local</h3>
            <p className="mb-2">Utilizamos Armazenamento Local (localStorage) e Cookies funcionais para:</p>
            <ul className="list-disc pl-5 space-y-1 text-slate-400">
              <li><strong>Autenticação Contínua:</strong> Manter tokens de sessão ativos com segurança.</li>
              <li><strong>Preferências de Interface:</strong> Preservar configurações de navegação e atalhos do simulador.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-blue-400 font-semibold mb-2 text-base">4. Direitos do Titular dos Dados (LGPD)</h3>
            <p className="mb-2">Conforme a Lei nº 13.709/2018, você possui os seguintes direitos garantidos:</p>
            <ul className="list-disc pl-5 space-y-1 text-slate-400">
              <li><strong>Acesso e Retificação:</strong> Visualizar e atualizar suas informações de perfil a qualquer momento.</li>
              <li><strong>Revogação e Exclusão:</strong> Solicitar o encerramento da conta e a eliminação completa de seus dados pessoais da base de dados.</li>
              <li><strong>Transparência:</strong> Informação clara sobre o tratamento de seus dados.</li>
            </ul>
          </section>

        </div>

        {/* RODAPÉ DO MODAL */}
        <div className="p-5 border-t border-slate-800 flex items-center justify-between bg-[#0d131d] rounded-b-2xl">
          <span className="text-xs text-slate-500 hidden sm:inline">
            RadioDent • Privacy by Default
          </span>

          {modoAceite ? (
            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <button 
                onClick={aoFechar}
                className="px-4 py-2.5 text-slate-400 hover:text-white font-medium rounded-lg text-sm transition-colors cursor-pointer"
              >
                Recusar
              </button>
              <button 
                onClick={lidarComAceite}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-sm transition-all cursor-pointer shadow-lg shadow-blue-600/20 active:scale-[0.98]"
              >
                Concordo e Aceito
              </button>
            </div>
          ) : (
            <button 
              onClick={aoFechar}
              className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-lg text-sm transition-colors cursor-pointer active:scale-[0.98]"
            >
              Entendi e Fechar
            </button>
          )}
        </div>

      </div>
    </div>
  );
}