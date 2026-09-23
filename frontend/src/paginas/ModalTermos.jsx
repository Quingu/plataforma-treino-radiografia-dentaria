import React from 'react';

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
        
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Termos de Uso & Privacidade</h2>
            <p className="text-xs text-slate-400">Conformidade LGPD (Lei nº 13.709/2018)</p>
          </div>
          
          <button 
            onClick={aoFechar}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer px-2 py-1 rounded-lg hover:bg-slate-800 text-lg leading-none"
            title="Fechar"
          >
            x
          </button>
        </div>

        <div className="p-6 overflow-y-auto text-sm text-slate-300 space-y-6 leading-relaxed custom-scrollbar">
          
          <p className="text-slate-400 italic text-xs border-l-2 border-blue-500 pl-3 py-1">
            Versão: 1.0 - 22/09/2026<br/>
            O <strong>RadioDent</strong> é uma plataforma acadêmica de treino radiográfico. O seu uso requer o consentimento explícito das condições e políticas descritas abaixo.
          </p>

          <section>
            <h3 className="text-blue-400 font-semibold mb-2 text-base">1. Natureza do Serviço e Regras de Uso</h3>
            <p className="mb-2">A utilização da plataforma está sujeita às seguintes regras fundamentais:</p>
            <ul className="list-disc pl-5 space-y-1 text-slate-400">
              <li>A plataforma não substitui avaliação clínica, diagnóstico, laudo profissional ou atendimento odontológico.</li>
              <li>O usuário deve proteger sua conta, utilizar dados corretos e não compartilhar suas credenciais de acesso.</li>
              <li>É expressamente proibida a inserção de dados identificáveis de pacientes nas imagens e radiografias submetidas.</li>
              <li>O uso indevido, tentativa de elevação de privilégios ou acesso a dados de terceiros pode resultar no bloqueio imediato da conta.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-blue-400 font-semibold mb-2 text-base">2. Tratamento de Dados Pessoais</h3>
            <p className="mb-2">Coletamos apenas os dados necessários para o funcionamento acadêmico (Base legal: Execução de Contrato e Legítimo Interesse):</p>
            <ul className="list-disc pl-5 space-y-1 text-slate-400">
              <li><strong>Dados de Cadastro:</strong> Nome, e-mail, senha criptografada e definição do perfil (Professor ou Aluno).</li>
              <li><strong>Dados Opcionais:</strong> Foto de perfil para identificação visual, fornecida mediante consentimento.</li>
              <li><strong>Auditoria e Segurança:</strong> Registramos o endereço IP e ações críticas no sistema. Estes logs são retidos por um período máximo de 180 dias.</li>
              <li><strong>Conteúdo Clínico:</strong> Resoluções e coordenadas enviadas nas atividades. Nenhuma radiografia ou dado clínico é utilizado para treinar modelos de Inteligência Artificial.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-blue-400 font-semibold mb-2 text-base">3. Cookies e Compartilhamento</h3>
            <p className="mb-2">O RadioDent preza pela minimização de exposição dos seus dados:</p>
            <ul className="list-disc pl-5 space-y-1 text-slate-400">
              <li>Utilizamos <strong>exclusivamente cookies estritamente necessários</strong> de sessão e segurança (proteção CSRF).</li>
              <li>Não utilizamos cookies de publicidade, nem realizamos rastreamento opcional ou venda de dados para terceiros.</li>
              <li>Compartilhamos dados de forma segura apenas com a infraestrutura essencial do projeto (Supabase para banco de dados, Scaleway para armazenamento e Brevo para e-mails transacionais).</li>
            </ul>
          </section>

          <section>
            <h3 className="text-blue-400 font-semibold mb-2 text-base">4. Seus Direitos (LGPD)</h3>
            <p className="mb-2">Você possui o controle sobre as suas informações. A qualquer momento é possível:</p>
            <ul className="list-disc pl-5 space-y-1 text-slate-400">
              <li>Confirmar a existência do tratamento, acessar e corrigir dados incompletos diretamente no perfil.</li>
              <li>Exportar os seus dados em formato estruturado (portabilidade).</li>
              <li>Solicitar a exclusão da sua conta, foto de perfil ou revogar consentimentos previamente concedidos.</li>
            </ul>
          </section>

        </div>

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