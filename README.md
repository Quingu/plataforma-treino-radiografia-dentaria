# Plataforma de Treino em Radiografia Dentária

![Python](https://img.shields.io/badge/Python-3.12-3776AB?style=flat-square&logo=python&logoColor=white)
![Django](https://img.shields.io/badge/Django-5.0-092E20?style=flat-square&logo=django&logoColor=white)
![React](https://img.shields.io/badge/React-18-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=flat-square&logo=supabase&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Relational-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![AWS S3](https://img.shields.io/badge/AWS_S3-Storage-569A31?style=flat-square&logo=amazon-s3&logoColor=white)

Sistema educacional desenvolvido como Projeto Final de Curso (PFC) focado no treinamento e diagnóstico por imagens radiográficas odontológicas. O sistema conta com um backend em Django REST Framework e uma interface interativa em React, focada em marcações de coordenadas clínicas e validações seguras.

**Equipe:** Gustavo Quintiliano e Bruno Shiraishi

## Visão Geral

O repositório utiliza a arquitetura de **Monorepo**, estando organizado em duas frentes principais:

- `backend/`: API RESTful construída com Django, responsável pela autenticação via JWT (HttpOnly Cookies), validação de regras de negócio (cálculo de acertos baseados em *Boxes*) e conexão com banco de dados PostgreSQL gerenciado pelo **Supabase** e armazenamento na AWS S3.
- `frontend/`: Single Page Application (SPA) em React/Vite com Tailwind CSS, contemplando dashboards segmentados para Professores (gestão de turmas e criação de gabaritos) e Alunos (feed de tarefas e ferramenta interativa de diagnóstico).

## Estrutura do Repositório

```text
plataforma-treino-radiografia-dentaria/
|-- README.md
|-- .gitignore
|-- backend/
|   |-- manage.py
|   |-- requirements.txt
|   |-- .env.example
|   |-- setup/
|   |-- users/
|   |-- core/
|   `-- api/
`-- frontend/
    |-- index.html
    |-- package.json
    |-- vite.config.js
    |-- tailwind.config.js
    |-- src/
    |   |-- assets/
    |   |-- components/
    |   |-- pages/
    |   |-- services/
    |   `-- main.jsx

```
## Arquitetura

O sistema opera no modelo Cliente-Servidor com renderização no cliente (SPA). O armazenamento de mídias é delegado à nuvem para garantir escalabilidade.

Fluxo principal da aplicação:

```text
Dashboard React (Professor/Aluno)
       |
       | HTTPS + JWT (Cookies HttpOnly)
       v
Backend Django REST Framework
       |
       |--> Supabase (PostgreSQL para dados relacionais e coordenadas)
       |--> AWS S3 (Datasets de radiografias públicas/privadas)
```
## Backend

### Stack

| Categoria | Tecnologia |
|---|---|
| Linguagem | Python 3.12 |
| Framework | Django 5.0 / DRF |
| Banco de dados | PostgreSQL (Hospedado no Supabase) |
| Armazenamento de Mídia | AWS S3 / Boto3 |
| Autenticação | JWT via Cookies HttpOnly (SimpleJWT) |
| Gerenciamento de Cors | Django-CORS-Headers |
| Variáveis de Ambiente | Python-dotenv |

### Rotas atualmente expostas (API REST)

#### Autenticação e Usuários

| Método | Endpoint | Descrição |
|---|---|---|
| `POST` | `/api/auth/registrar/` | Cadastro com divisão de perfil (Aluno/Professor). Professores exigem validação de e-mail institucional. |
| `POST` | `/api/auth/login/` | Autentica e retorna JWT no Cookie HttpOnly. |
| `POST` | `/api/auth/logout/` | Invalida o cookie de sessão atual. |
| `GET` | `/api/users/me/` | Retorna o perfil autenticado e sua *role* (papel). |

#### Gestão de Turmas

| Método | Endpoint | Descrição |
|---|---|---|
| `GET` | `/api/turmas/` | Lista turmas associadas ao usuário logado. |
| `POST` | `/api/turmas/` | Cria nova turma e gera código de convite único (Apenas Professor). |
| `POST` | `/api/turmas/entrar/` | Associa o aluno à turma via código de convite (Apenas Aluno). |

#### Atividades Clínicas

| Método | Endpoint | Descrição |
|---|---|---|
| `GET` | `/api/dataset/` | Lista radiografias disponíveis (Tufts, Kaggle, uploads). |
| `POST` | `/api/tarefas/` | Cria nova tarefa vinculando imagem e coordenadas da *Bounding Box* (Apenas Professor). |
| `GET` | `/api/tarefas/` | Lista o feed de tarefas de uma turma específica. |
| `POST` | `/api/submissoes/` | Recebe a coordenada (X,Y) do clique do aluno, calcula o acerto no servidor e retorna a nota. |

### Modelos principais

As entidades de domínio mapeadas no banco relacional são:

- `CustomUser`: Diferencia alunos de professores (`ehaluno`, `ehprofessor`).
- `Turma`: Armazena o código alfanumérico e a relação N:N com os usuários.
- `Radiografia`: Metadados da imagem clínica e URL de referência no S3.
- `Tarefa`: Relaciona uma Radiografia a uma Turma, contendo o gabarito espacial (`x_min, x_max, y_min, y_max`).
- `Submissao`: Armazena a tentativa do aluno, coordenadas clicadas e o status de aprovação.

### Segurança

O backend implementa o paradigma de *Zero Trust*:
- O token JWT nunca é retornado no *body* da requisição, sendo protegido pelo navegador contra ataques XSS (via `HttpOnly`).
- O Front-end não possui a lógica matemática de correção; a validação de sobreposição de coordenadas ocorre exclusivamente no Back-end.
- Proteção nativa do Django contra injeção de SQL e CSRF.
- *Role-Based Access Control* (RBAC) via permissões customizadas do DRF (ex: `IsProfessor`, `IsStudent`).

### Como rodar o backend localmente

#### Pré-requisitos
- Python 3.12+
- Projeto criado no **Supabase** (para obter as credenciais do banco PostgreSQL).
- Credenciais da AWS (S3).

#### Instalação e Execução

```bash
# 1. Clonar o repositório
git clone [https://github.com/Quingu/plataforma-treino-radiografia-dentaria.git](https://github.com/Quingu/plataforma-treino-radiografia-dentaria.git)

cd plataforma-treino-radiografia-dentaria/backend
python -m venv venv

# Linux/macOS
source venv/bin/activate
# Windows
venv\Scripts\activate

pip install -r requirements.txt
```
Crie um arquivo `.env` baseado no `.env.example`:
```env
SECRET_KEY=sua_chave_django
DEBUG=True

# Credenciais do Supabase (Database)
DATABASE_URL=postgres://postgres.[sua-ref]:[sua-senha]@aws-0-[regiao][.pooler.supabase.com:6543/postgres](https://.pooler.supabase.com:6543/postgres)

# Credenciais AWS S3
AWS_ACCESS_KEY_ID=sua_chave_aws
AWS_SECRET_ACCESS_KEY=seu_secret_aws
AWS_STORAGE_BUCKET_NAME=nome_do_bucket
```
Execute as migrações e inicie o servidor:
```bash
python manage.py migrate
python manage.py runserver
```
API local: `http://localhost:8000`

---

## Frontend

O frontend foi desenvolvido focado na usabilidade clínica (High Contrast Dark Mode) para facilitar a visualização de radiografias.

### Funcionalidades
- **Fluxo de Autenticação Segura:** Proteção de rotas baseada na resposta da API.
- **Painel do Professor:** Criação de turmas, geração de convites e o "Estúdio de Anotação" (Lógica de desenhar a área de anomalia com *click & drag*).
- **Painel do Aluno:** Ingresso em turmas por código, mural de tarefas e interação visual baseada em cliques de precisão sobre as imagens mapeadas percentualmente (0-100%).

### Como rodar o frontend localmente

#### Pré-requisitos
- Node.js v18+

#### Instalação e Execução

```bash
cd frontend
npm install

# Iniciar o servidor de desenvolvimento
npm run dev
```
Aplicação local: `http://localhost:5173`

## Licença

Projeto acadêmico (PFC). Todos os direitos reservados aos autores.

