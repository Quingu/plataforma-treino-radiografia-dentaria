# Plataforma de Treino em Radiografia Dentária

![Python](https://img.shields.io/badge/Python-3.12-3776AB?style=flat-square&logo=python&logoColor=white)
![Django](https://img.shields.io/badge/Django-5.0-092E20?style=flat-square&logo=django&logoColor=white)
![React](https://img.shields.io/badge/React-18-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=flat-square&logo=supabase&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Relational-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![Scaleway Object Storage](https://img.shields.io/badge/Scaleway_Object_Storage-Storage-4F0599?style=flat-square&logo=scaleway&logoColor=white)
![Brevo](https://img.shields.io/badge/Brevo-0092FF?style=flat-square&logo=brevo&logoColor=white)

Sistema educacional desenvolvido como o foco no treinamento e diagnóstico por imagens radiográficas odontológicas. O sistema conta com um backend em Django REST Framework e uma interface interativa em React, focada em marcações de coordenadas clínicas e validações seguras.

**Equipe:** Gustavo Quintiliano e Bruno Shiraishi

## Visão Geral

O repositório utiliza a arquitetura de **Monorepo**, estando organizado em duas frentes principais:

- `backend/`: API RESTful construída com Django, responsável pela autenticação via JWT (HttpOnly Cookies), validação de regras de negócio (cálculo de acertos baseados em *Boxes*) e conexão com banco de dados PostgreSQL gerenciado pelo **Supabase** e armazenamento no Scaleway.
- `frontend/`: Single Page Application (SPA) em React/Vite com Tailwind CSS, contemplando dashboards segmentados para Professores (gestão de turmas e criação de gabaritos) e Alunos (feed de tarefas e ferramenta interativa de diagnóstico).
- `docs/`: Termos de Uso, Política de Privacidade e documentação de controles LGPD.


## Estrutura do Repositório

```text
plataforma-treino-radiografia-dentaria/
|-- README.md
|-- .gitignore
|-- backend/
|   |-- manage.py
|   |-- build.sh
|   |-- pytest.ini
|   |-- requirements.txt
|   |-- .env.example
|   |-- setup/
|   |-- users/
|   |-- tarefas/
|   |-- radiografias/
|   `-- turmas/
|   `-- ranking/
|-- docs/
|   `-- LGPD.md/
|   `-- POLITICA_DE_PRIVACIDADE.md/
|   `-- TERMOS_DE_USO.md/
`-- frontend/
    |-- index.html
    |-- .gitignore
    |-- .oxlintrc.json
    |-- package-lock.json
    |-- package.json
    |-- vite.config.js
    |-- tailwind.config.js
    |-- src/
    |-- public/

```

## Arquitetura por domínio

O backend adota organização por feature/domínio. Cada domínio preserva suas próprias camadas `models`, `serializers`, `services`, `views`, `rotas`, `tests` e `migrations`.

```text
backend/
|-- setup/                 # Configurações e rotas-raiz do Django
|-- users/                 # Conta, autenticação, 2FA, consentimentos e direitos LGPD
|-- turmas/                # Turmas e vínculos entre professores e alunos
|-- radiografias/          # Casos clínicos, acesso privado e auditoria de imagens
|-- tarefas/               # Tarefas, gabaritos e resoluções
|-- ranking/               # Gamificação e ranking
```

Fluxo principal:

```text
React SPA
  |
  | HTTPS + cookies HttpOnly + CSRF
  v
Django REST Framework
  |-- Supabase/PostgreSQL: contas, turmas, tarefas, consentimentos e auditoria
  |-- Scaleway Object Storage: imagens privadas com URLs assinadas
  `-- Brevo: e-mails de recuperação de senha
```


## Stack

| Categoria | Tecnologia |
| --- | --- |
| Backend | Python 3.12, Django 5 e Django REST Framework |
| Frontend | React 18, Vite e Tailwind CSS |
| Banco de dados | PostgreSQL hospedado no Supabase |
| Midia | Scaleway Object Storage via Boto3/Django Storages |
| Autenticação | SimpleJWT em cookies `HttpOnly` |
| Seguranca | CSRF, RBAC, 2FA, rotação de refresh token e auditoria |
| E-mail | Brevo |

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
| `GET`, `POST` | `/radiografias/casos-clinicos/` | Lista biblioteca do professor ou inclui caso clínico. |
| `GET`, `DELETE` | `/radiografias/radiografias/<uuid>/` | Consulta ou exclui radiografia do professor proprietário. |
| `GET`, `POST` | `/tarefas/tarefas/` | Lista tarefas autorizadas ou cria tarefa como professor. |
| `POST` | `/tarefas/tarefas/<uuid>/resolver/` | Envia a resolução do aluno para correção no servidor. |
| `GET` | `/ranking/` | Retorna o ranking de alunos. |

### Modelos principais

As entidades de domínio mapeadas no banco relacional são:

- `CustomUser`: Diferencia alunos de professores (`eh_aluno`, `eh_professor`).
- `Turma`: Armazena o código alfanumérico e a relação N:N com os usuários.
- `Radiografia`: Metadados da imagem clínica e URL de referência no S3.
- `Tarefa`: Relaciona uma Radiografia a uma Turma, contendo o gabarito espacial (`x_min, x_max, y_min, y_max`).
- `Submissao`: Armazena a tentativa do aluno, coordenadas clicadas e o status de aprovação.


## Seguranca e privacidade

- Access e refresh tokens não são expostos ao JavaScript; ficam em cookies `HttpOnly`, `Secure` em produção e `SameSite=Lax`.
- Requisições que alteram dados usam proteção CSRF.
- Refresh tokens são rotacionados e invalidados no logout.
- Senhas utilizam Argon2; o segredo de 2FA é criptografado em repouso.
- O storage de radiografias é privado e usa URLs assinadas de curta duração.
- A autorização é conferida no backend: alunos acessam somente tarefas das turmas às quais são vinculadas, e professores apenas seus recursos.
- Gabaritos não são retornados para alunos.
- Logs registram metadados de seguranca, sem senhas, JWTs, imagens ou conteúdo clinico.

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

Crie `backend/.env` a partir de `.env.example`. As variaveis `SECRET_KEY` e `TWO_FACTOR_ENCRYPTION_KEY` são obrigatorias. Gere a segunda com:

```bash
python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
```

Em desenvolvimento, use hosts e origens locais. Em produção, use `DEBUG=False`, defina `ALLOWED_HOSTS` com os dominios reais e mantenha as credenciais somente no ambiente de deploy.

```bash
python manage.py migrate
python manage.py runserver
```

Para aplicar a retencao de dados, agende diariamente:

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


## Testes

No diretório `backend/`:

```bash
pytest
```

No diretório `frontend/`:

```bash
npm run build
```

### Funcionalidades
- **Gamificação:** Geração de xp ao acertar a resposta nas tarefas e criação de Rankings.
- **Painel do Professor:** Criação de turmas, geração de convites e o "Estúdio de Anotação" (Lógica de desenhar a área de anomalia com *click & drag*).
- **Painel do Aluno:** Ingresso em turmas por código, mural de tarefas e interação visual baseada em cliques de precisão sobre as imagens mapeadas percentualmente (0-100%).


## Licença

Projeto acadêmico (PFC). Todos os direitos reservados aos autores.

