# Plataforma de Treino em Radiografia Dentária

![Python](https://img.shields.io/badge/Python-3.12-3776AB?style=flat-square&logo=python&logoColor=white)
![Django](https://img.shields.io/badge/Django-5.0-092E20?style=flat-square&logo=django&logoColor=white)
![React](https://img.shields.io/badge/React-19-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=flat-square&logo=supabase&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Relational-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![Scaleway Object Storage](https://img.shields.io/badge/Scaleway_Object_Storage-Storage-4F0599?style=flat-square&logo=scaleway&logoColor=white)
![Brevo](https://img.shields.io/badge/Brevo-0092FF?style=flat-square&logo=brevo&logoColor=white)

Sistema educacional voltado ao treinamento e diagnóstico por imagens radiográficas odontológicas, com suporte a radiografias 2D e modelos anatômicos 3D no formato GLB. O backend em Django REST Framework e a interface em React oferecem marcações 2D por área e marcações 3D por ponto anatômico, sempre validadas no servidor.

**Equipe:** Gustavo Quintiliano

## Visão Geral

O repositório utiliza a arquitetura de **Monorepo**, estando organizado em duas frentes principais:

- `backend/`: API RESTful construída com Django, responsável pela autenticação via JWT (HttpOnly Cookies), validação de regras de negócio (cálculo de acertos para áreas 2D e pontos 3D), conexão com banco de dados PostgreSQL gerenciado pelo **Supabase** e armazenamento privado no Scaleway.
- `frontend/`: Single Page Application (SPA) em React/Vite com Tailwind CSS, contemplando dashboards segmentados para Professores (gestão de turmas, biblioteca de casos clínicos e criação de gabaritos 2D/3D) e Alunos (feed de tarefas, ferramenta interativa de diagnóstico 2D e visualizador 3D).
- `docs/`: Termos de Uso, Política de Privacidade e documentação de controles LGPD.


## Estrutura do Repositório

```text
plataforma-treino-radiografia-dentaria/
|-- README.md
|-- .gitignore
|-- backend/
|   |-- manage.py
|   |-- build.sh
|   |-- pytest.ini
|   |-- requirements.txt
|   |-- .env.example
|   |-- setup/
|   |-- users/
|   |-- turmas/
|   |-- radiografias/
|   |-- tarefas/
|   `-- ranking/
|-- docs/
|   |-- LGPD.md
|   |-- POLITICA_DE_PRIVACIDADE.md
|   `-- TERMOS_DE_USO.md
`-- frontend/
    |-- index.html
    |-- package.json
    |-- vite.config.js
    |-- vercel.json
    `-- src/
        |-- componentes/
        |-- hooks/
        |-- paginas/
        |-- services/
        `-- utils/
```

## Arquitetura por domínio

O backend adota organização por feature/domínio. Cada domínio preserva suas próprias camadas `models`, `serializers`, `services`, `views`, `rotas`, `tests` e `migrations`.

```text
backend/
|-- setup/                 # Configurações e rotas-raiz do Django
|-- users/                 # Conta, autenticação, 2FA, consentimentos e direitos LGPD
|-- turmas/                # Turmas e vínculos entre professores e alunos
|-- radiografias/          # Casos clínicos 2D/3D, acesso privado e auditoria de imagens
|-- tarefas/               # Tarefas, gabaritos 2D/3D e resoluções
|-- ranking/               # Gamificação e ranking
```

Fluxo principal:

```text
React SPA
  |
  | HTTPS + cookies HttpOnly + CSRF
  v
Django REST Framework
  |-- Supabase/PostgreSQL: contas, turmas, casos clínicos, tarefas, consentimentos e auditoria
  |-- Scaleway Object Storage: radiografias e modelos 3D privados com URLs assinadas
  `-- Brevo: e-mails de recuperação de senha
```


## Stack

| Categoria | Tecnologia |
| --- | --- |
| Backend | Python 3.12, Django 5 e Django REST Framework |
| Frontend | React 19, Vite 8 e Tailwind CSS 4 |
| Visualização 3D | Three.js, React Three Fiber e Drei |
| Banco de dados | PostgreSQL hospedado no Supabase |
| Mídia | Scaleway Object Storage via Boto3/Django Storages |
| Autenticação | SimpleJWT em cookies `HttpOnly` |
| Segurança | CSRF, RBAC, 2FA, rotação de refresh token e auditoria |
| E-mail | Brevo |

## Funcionalidades

- **Gamificação:** Geração de xp ao acertar a resposta nas tarefas e criação de Rankings.
- **Painel do Professor:** Criação de turmas, geração de convites, biblioteca de radiografias 2D e modelos 3D, "Estúdio de Anotação" 2D (*click & drag*), criação de atividades 3D com ponto de referência e tolerância, e dashboard com filtros, indicadores consolidados e gráficos de acompanhamento.
- **Painel do Aluno:** Ingresso em turmas por código, mural de tarefas, resolução 2D baseada em áreas percentuais (0-100%) e resolução 3D com clique direto no modelo.
- **Modelos 3D:** Visualização com rotação, zoom e marcação convertida para o espaço local do arquivo GLB; a correção por distância é feita no servidor.

## Rotas da API

Base local: `http://localhost:8000/api`

### Autenticação, perfil e direitos do titular

| Método | Endpoint | Descrição |
| --- | --- | --- |
| `POST` | `/auth/registro/` | Cria conta e registra aceite versionado de Termos e Política. |
| `GET` | `/auth/csrf/` | Inicializa o token CSRF. |
| `POST` | `/auth/login/` | Inicia a sessão com cookies seguros; pode exigir 2FA. |
| `POST` | `/auth/login/2fa/` | Conclui o segundo fator. |
| `POST` | `/auth/token/atualizar/` | Atualiza o access token pelo refresh cookie. |
| `POST` | `/auth/logout/` | Invalida a sessão e remove os cookies. |
| `POST` | `/auth/2fa/configurar/` | Gera URI de configuração do autenticador. |
| `POST` | `/auth/2fa/verificar/` | Verifica um código 2FA. |
| `POST` | `/auth/recuperar-senha/solicitar/` | Solicita a recuperação de senha. |
| `POST` | `/auth/recuperar-senha/redefinir/` | Redefine senha com token temporário. |
| `GET`, `PATCH` | `/auth/perfil/` | Consulta ou atualiza o perfil autenticado. |
| `GET` | `/auth/dados/exportar/` | Exporta os dados do titular autenticado. |
| `POST` | `/auth/dados/solicitacoes/` | Solicita acesso, correção, exclusão, restrição ou revogação. |

### Domínios educacionais

| Método | Endpoint | Descrição |
| --- | --- | --- |
| `GET`, `POST` | `/turmas/` | Lista ou cria turmas conforme o perfil. |
| `POST` | `/turmas/entrar/` | Vincula aluno a turma por código de convite. |
| `GET`, `POST` | `/radiografias/casos-clinicos/` | Lista a biblioteca ou inclui caso clínico 2D/3D. Aceita `?tipo_midia=radiografia_2d` ou `?tipo_midia=modelo_3d`. |
| `GET`, `DELETE` | `/radiografias/radiografias/<uuid>/` | Consulta ou exclui um caso clínico do professor proprietário. |
| `GET`, `POST` | `/tarefas/` | Lista tarefas autorizadas ou cria tarefa como professor. Aceita `?tipo=radiografia_2d` ou `?tipo=modelo_3d`. |
| `GET` | `/tarefas/dashboard-professor/` | Retorna indicadores, séries para gráficos e tarefas recentes das turmas do professor autenticado. Aceita `data_inicio`, `data_fim`, `turma_id`, `tipo`, `aluno_id` e `limite`. |
| `POST` | `/tarefas/<uuid>/resolver/` | Envia a resolução do aluno para correção no servidor. |
| `GET` | `/ranking/` | Retorna o ranking de alunos. |

> O prefixo legado `/tarefas/tarefas/` continua disponível como alias de compatibilidade.

### Modelos principais

As entidades de domínio mapeadas no banco relacional são:

- `CustomUser`: Diferencia alunos de professores (`eh_aluno`, `eh_professor`).
- `Turma`: Armazena o código alfanumérico e a relação N:N com os usuários.
- `CasoClinico`: Metadados do caso clínico, com `tipo_midia` (`radiografia_2d` ou `modelo_3d`), imagem 2D ou modelo GLB, visibilidade e professor proprietário.
- `Tarefa`: Relaciona um `CasoClinico` a uma `Turma`, com `tipo` de atividade e gabarito 2D (`x_min, x_max, y_min, y_max`) ou 3D (ponto local e tolerância).
- `ResolucaoTarefa`: Armazena a tentativa do aluno, as coordenadas enviadas e o resultado da correção.
- `PerfilGamificacao` e `RegistroXp`: Controlam a pontuação e a evolução no ranking.
- `LogAcessoRadiografia`: Registra auditoria de acesso a imagens e modelos.


## Segurança e privacidade

- Access e refresh tokens não são expostos ao JavaScript; ficam em cookies `HttpOnly`, `Secure` em produção e `SameSite=Lax`.
- Requisições que alteram dados usam proteção CSRF.
- Refresh tokens são rotacionados e invalidados no logout.
- Senhas utilizam Argon2; o segredo de 2FA é criptografado em repouso.
- O storage de radiografias e modelos 3D é privado e usa URLs assinadas de curta duração.
- A autorização é conferida no backend: alunos acessam somente tarefas das turmas às quais são vinculadas, e professores apenas seus recursos.
- Gabaritos 2D e 3D não são retornados para alunos antes da resposta.
- A correção 2D e 3D ocorre no servidor; o aluno nunca recebe a coordenada correta antecipadamente.
- Logs registram metadados de segurança, sem senhas, JWTs, imagens ou conteúdo clínico.

Documentação de privacidade:

- [Política de Privacidade](docs/POLITICA_DE_PRIVACIDADE.md)
- [Termos de Uso](docs/TERMOS_DE_USO.md)
- [Matriz e controles LGPD](docs/LGPD.md)


## Como executar localmente

### Backend

Pré-requisitos: Python 3.12+, PostgreSQL/Supabase e credenciais de storage Scaleway.

```bash
git clone https://github.com/Quingu/plataforma-treino-radiografia-dentaria.git
cd plataforma-treino-radiografia-dentaria/backend

python -m venv venv
# Linux/macOS: source venv/bin/activate
# Windows: venv\Scripts\activate

pip install -r requirements.txt
```

Crie `backend/.env` a partir de `.env.example`. As variáveis `SECRET_KEY` e `TWO_FACTOR_ENCRYPTION_KEY` são obrigatórias. Gere a segunda com:

```bash
python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
```

Em desenvolvimento, use hosts e origens locais. Em produção, use `DEBUG=False`, defina `ALLOWED_HOSTS` com os domínios reais e mantenha as credenciais somente no ambiente de deploy.

Para tarefas 3D, configure também `SCALEWAY_MODELOS_3D_PREFIX` (padrão `modelos_3d/`) e `MODELO_3D_MAX_BYTES` (padrão 50 MB).

```bash
python manage.py migrate
python manage.py runserver
```

Para importar os modelos `.glb` institucionais do bucket Scaleway:

```bash
python manage.py importar_modelos_3d_scaleway
```

Se arquivos forem removidos diretamente do bucket, remova os casos órfãos com:

```bash
python manage.py limpar_casos_sem_midia --dry-run
python manage.py limpar_casos_sem_midia
```

Para aplicar a retenção de dados, agende diariamente:

```bash
python manage.py aplicar_retencao_lgpd
python manage.py aplicar_retencao_radiografias
```

### Frontend

Pré-requisito: Node.js 18+.

```bash
cd frontend
npm install
npm run dev
```

Aplicação local: `http://localhost:5173`.

Validação de código e build:

```bash
npm run lint
npm run build
```


## Testes

No diretório `backend/`:

```bash
pytest --import-mode=importlib
```

No diretório `frontend/`:

```bash
npm run build
```

## Licença

Projeto acadêmico (PFC). Todos os direitos reservados aos autores.
