# Política de Privacidade - RadioDent

**Versão:** 1.0 - 22/09/2026

Esta Política de Privacidade descreve como a plataforma acadêmica RadioDent (atuando como controlador de dados para os fins deste projeto) coleta, utiliza, armazena e protege os seus dados pessoais. O sistema foi desenvolvido com foco na privacidade e minimização de dados.

### 1. Dados Pessoais Tratados, Finalidades e Bases Legais

Para o funcionamento da plataforma, tratamos as seguintes categorias de dados:

*   **Dados de Cadastro (Nome, E-mail, Senha e Perfil):** Utilizados para criar a sua conta, realizar a autenticação segura e viabilizar a sua participação nas turmas. **Base legal:** Execução de Contrato.
*   **Foto de Perfil (Opcional):** Utilizada para identificação visual dentro do ambiente da turma. **Base legal:** Consentimento (podendo ser revogado e a foto excluída a qualquer momento).
*   **Radiografias e Atividades Clínicas:** Imagens utilizadas exclusivamente para a criação de exercícios acadêmicos. **As radiografias devem ser inseridas de forma totalmente desidentificada**, sendo proibido o envio de dados reais de pacientes. **Base legal:** Execução de Contrato (para viabilizar a ferramenta educacional).
*   **Dados de Interação (Coordenadas, Resoluções de Tarefas):** Utilizados para correção de exercícios e acompanhamento do desempenho pelo professor responsável. **Base legal:** Execução de Contrato.
*   **Logs de Acesso e Segurança:** O sistema coleta o endereço IP (armazenado de forma segura) e a data/hora de ações críticas no sistema (como logins e exclusões) para auditoria e prevenção contra fraudes. **Base legal:** Cumprimento de Obrigação Legal (Marco Civil da Internet) e Legítimo Interesse (segurança da plataforma). *Nota: O sistema jamais registra senhas, tokens ou dados clínicos nesses logs.*

### 2. Compartilhamento e Serviços Externos

Seus dados não são vendidos ou compartilhados para fins publicitários. Utilizamos serviços externos estritamente necessários para a operação da infraestrutura, o que pode envolver o armazenamento em servidores fora do Brasil, sempre protegidos pelas devidas salvaguardas contratuais e técnicas de segurança:

*   **Supabase:** Hospedagem do banco de dados (cadastros, logs, informações de turmas e tarefas).
*   **Scaleway:** Armazenamento seguro de arquivos (radiografias privadas e fotos de perfil). O acesso aos arquivos ocorre apenas mediante URLs temporárias e assinadas, validadas pelo nosso sistema.
*   **Brevo:** Serviço utilizado exclusivamente para o disparo de e-mails transacionais, como os links de recuperação de senha.

### 3. Cookies e Tecnologias de Rastreamento

Utilizamos **exclusivamente cookies de sessão estritamente necessários** (com as diretivas `HttpOnly` e `Secure`), que servem apenas para manter a sua conta conectada com segurança e proteger as requisições contra ataques maliciosos (CSRF). 
**Não há cookies opcionais, de publicidade ou de rastreamento de terceiros** no RadioDent.

### 4. Retenção e Descarte de Dados

Os seus dados são armazenados apenas pelo tempo necessário para cumprir as finalidades descritas:
*   **Contas de Usuário:** Mantidas enquanto a conta estiver ativa.
*   **Logs de Auditoria e Segurança:** Retidos por um período máximo de 180 dias, sendo excluídos automaticamente pelos nossos processos de varredura.
*   **Radiografias e Exercícios:** Mantidos até o fim do período acadêmico estipulado para a atividade ou até que o professor responsável ou usuário solicitem a exclusão.

### 5. Seus Direitos como Titular

Em conformidade com a LGPD, você possui o direito de:
*   Confirmar a existência de tratamento e acessar os seus dados cadastrais e histórico de resoluções.
*   Corrigir dados incompletos, inexatos ou desatualizados diretamente no seu perfil.
*   Solicitar a exclusão ou anonimização da sua conta e de dados tratados com base no consentimento.
*   Exportar os seus dados (portabilidade) em formato estruturado.

Para exercer seus direitos, utilize as opções disponíveis no painel de configurações do usuário na plataforma ou entre em contato com a equipe responsável.

### 6. Segurança e Resposta a Incidentes

Adotamos medidas técnicas robustas para proteger seus dados, incluindo a criptografia avançada de senhas (padrão Argon2), rotação de chaves de autenticação (JWT) e isolamento de acessos no banco de dados. Em caso de qualquer incidente de segurança que possa causar risco ou dano relevante, comunicaremos imediatamente os usuários afetados e a Autoridade Nacional de Proteção de Dados (ANPD), conforme nosso plano interno de resposta a incidentes.

### 7. Atualizações desta Política

Mudanças relevantes na forma como tratamos os seus dados resultarão em uma nova versão desta Política de Privacidade, e os usuários ativos serão notificados através do e-mail cadastrado ou por um aviso destacado na plataforma.


Para uma visualização mais detalhada, verifique em  [LGPD.md](LGPD.md).