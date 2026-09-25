# Privacidade e Proteção de Dados - RadioDent

**Versão:** 1.0 - 22/09/2026

## Inventário e Matriz de Tratamento

| Dado | Finalidade | Base Legal | Acesso | Fornecedor | Retenção |
| --- | --- | --- | --- | --- | --- |
| Nome, e-mail, senha com hash e perfil | Criar e autenticar a conta | Execução de Contrato | Titular e administração autorizada | Supabase | Conta ativa e prazo justificado |
| Foto de perfil | Identificação visual (opcional) | Consentimento | Titular e utilizadores autorizados | Scaleway | Até exclusão da foto ou conta |
| Radiografias desidentificadas | Criar exercícios académicos | Execução de Contrato | Professor proprietário e alunos da tarefa | Scaleway | Até conclusão da atividade ou prazo informado |
| Coordenadas e resultados | Correção e acompanhamento | Execução de Contrato | Aluno e professor da turma | Supabase | Período académico informado |
| Logs de auditoria (com IP) | Segurança e auditoria | Obrigação Legal / Interesse Legítimo | Administração autorizada | Supabase | 180 dias |
| Consentimentos | Comprovar manifestação | Obrigação Legal | Administração autorizada | Supabase | Enquanto necessário para comprovação |
| E-mail de recuperação | Recuperar acesso | Execução de Contrato | Titular | Brevo | Token inválido em 15 min |

*Este projeto **não utiliza** radiografias ou dados clínicos para treinar Inteligência Artificial*.

## Matriz de Perfis e Permissões (RBAC)

De forma a garantir o princípio do menor privilégio e os cuidados específicos da área da educação, o sistema implementa os seguintes controlos de acesso:

| Perfil | Permissões e Acessos Autorizados |
| --- | --- |
| **Aluno** | Pode aceder apenas ao próprio perfil, visualizar as tarefas atribuídas à sua turma, enviar as suas resoluções e consultar as próprias notas. Não tem autorização para visualizar dados ou resoluções de outros alunos. |
| **Professor** | Pode criar e gerir as suas próprias turmas, submeter radiografias (sendo obrigatória a desidentificação dos dados do paciente), criar tarefas e visualizar o desempenho exclusivamente dos alunos inscritos nas suas turmas. Não tem acesso a turmas ou dados geridos por outros professores. |
| **Administrador** | Pode gerir utilizadores e consultar os logs de segurança e auditoria do sistema. Não possui acesso direto ao conteúdo clínico ou às radiografias inseridas pelos professores. |

## Fornecedores

| Fornecedor | Papel | Dados enviados | Salvaguardas |
| --- | --- | --- | --- |
| Supabase | Banco de Dados PostgreSQL | Contas, turmas, tarefas, logs e consentimentos | Credenciais externas e acesso restrito |
| Scaleway | Armazenamento (Storage) | Radiografias e fotos autorizadas | Bucket privado, URLs assinadas e autorização validada no backend |
| Brevo | Disparo de E-mails | E-mail, nome e link de recuperação de senha | Chave armazenada fora do repositório de código e uso restrito |



## Retenção, Direitos dos Titulares e Resposta a Incidentes

O comando `python manage.py aplicar_retencao_lgpd` remove tokens de recuperação com mais de um dia e logs do domínio `users` com mais de 180 dias. O domínio `radiografias` possui o seu próprio comando, `python manage.py aplicar_retencao_radiografias`, focado nas auditorias clínicas. Agende a execução de ambos diariamente em produção.

O titular pode exportar os seus dados através de `GET /api/auth/dados/exportar/` e abrir solicitações de acesso, correção, exclusão, restrição ou revogação de consentimento através de `POST /api/auth/dados/solicitacoes/`. A equipa responsável deve executar a medida cabível, incluindo a remoção de objetos no storage e nos backups, e registar a conclusão do processo.

**Plano de resposta a incidentes:** detetar e confirmar o incidente, conter o problema e preservar evidências, identificar os dados e os titulares afetados, avaliar o risco ou dano relevante, definir e executar as comunicações necessárias (à ANPD e aos titulares), corrigir a causa raiz e registar as medidas adotadas.

## Controlos Técnicos de Segurança

*   As senhas utilizam hash forte com *salt* (padrão Argon2); a recuperação de senha utiliza um token temporário e de uso único.
*   O controlo de sessão utiliza cookies com as flags `HttpOnly` e `SameSite=Lax`, exigindo a diretiva `Secure` em ambiente de produção, além de implementar proteção contra vulnerabilidades CSRF.
*   Os *refresh tokens* são rotacionados e devidamente invalidados no momento do logout.
*   Os segredos da Autenticação de Dois Fatores (2FA) são encriptados em repouso através de uma chave externa ao código-fonte.
*   Os logs de sistema guardam apenas metadados essenciais para auditoria. Em nenhuma circunstância registam senhas em texto limpo, JWTs, imagens ou qualquer conteúdo clínico.