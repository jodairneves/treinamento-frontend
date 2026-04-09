# Barbearia - Frontend

Interface web para sistema de agendamento de barbearias. Inclui area publica para clientes e painel administrativo para donos de barbearias.

## Tecnologias

- **React** 18.x
- **React Router** 6.x
- **Axios** para requisicoes HTTP
- **Vite** 5.x como bundler
- **CSS** puro (sem framework)

## Requisitos

- Node.js 18+

## Instalacao

```bash
# Instalar dependencias
npm install

# Copiar variaveis de ambiente (se necessario)
cp .env.example .env
```

## Executando

```bash
# Desenvolvimento
npm run dev

# Build para producao
npm run build

# Preview do build
npm run preview
```

O servidor de desenvolvimento roda em `http://localhost:5173` com proxy automatico para a API backend.

## Variaveis de Ambiente

| Variavel | Descricao | Exemplo |
|---|---|---|
| `VITE_API_TARGET` | URL do backend (para proxy do Vite) | `http://localhost:3000` |

## Estrutura do Projeto

```
src/
├── api/                # Configuracao HTTP
│   ├── axios.js        # Instancia do Axios com interceptors
│   └── services.js     # Servicos da API (public, auth, cliente, admin)
├── components/         # Componentes reutilizaveis
│   ├── Layout.jsx      # Layout do painel admin (sidebar)
│   ├── PublicLayout.jsx # Layout publico (header/nav)
│   ├── ProtectedRoute.jsx # Protecao de rotas por role
│   ├── Modal.jsx       # Modal reutilizavel
│   └── StatusBadge.jsx # Badge de status dos agendamentos
├── context/            # Contextos React
│   └── AuthContext.jsx # Autenticacao (JWT, roles, login/logout)
├── hooks/              # Hooks customizados
│   ├── useFetch.js     # Hook generico para chamadas API
│   └── useToast.jsx    # Sistema de notificacoes toast
├── pages/              # Paginas da aplicacao
│   ├── Home.jsx        # Listagem publica de barbearias
│   ├── BarbeariaPublic.jsx # Detalhes da barbearia + agendamento
│   ├── ClienteLogin.jsx    # Login do cliente
│   ├── ClienteRegistro.jsx # Registro do cliente
│   ├── MeusAgendamentos.jsx # Agendamentos do cliente
│   ├── AdminLogin.jsx      # Login da barbearia
│   ├── AdminRegistro.jsx   # Registro da barbearia
│   ├── Dashboard.jsx       # Dashboard admin
│   ├── Agendar.jsx         # Criar agendamento (admin)
│   ├── Agendamentos.jsx    # Gestao de agendamentos
│   ├── Barbeiros.jsx       # Gestao de barbeiros + agenda + bloqueios
│   ├── Servicos.jsx        # Gestao de servicos
│   ├── Clientes.jsx        # Gestao de clientes
│   └── AdminPerfil.jsx     # Perfil da barbearia
├── App.jsx             # Rotas da aplicacao
├── main.jsx            # Ponto de entrada
└── index.css           # Estilos globais
```

## Paginas e Funcionalidades

### Area Publica

- **Home** (`/`) - Listagem de todas as barbearias com busca por nome ou cidade
- **Barbearia** (`/barbearia/:slug`) - Pagina da barbearia com barbeiros, servicos, precos e fluxo de agendamento em 4 etapas

### Area do Cliente

- **Login** (`/cliente/login`) - Autenticacao do cliente
- **Registro** (`/cliente/registro`) - Cadastro de novo cliente
- **Meus Agendamentos** (`/cliente/agendamentos`) - Historico de agendamentos com opcao de cancelamento

### Painel Administrativo

- **Login** (`/admin/login`) - Autenticacao da barbearia
- **Registro** (`/admin/registro`) - Cadastro de nova barbearia (formulario em 3 etapas)
- **Dashboard** (`/admin`) - Visao geral com estatisticas e agendamentos do dia
- **Agendar** (`/admin/agendar`) - Criar agendamento manual (wizard de 4 etapas)
- **Agendamentos** (`/admin/agendamentos`) - Listagem completa com filtros e acoes de status
- **Barbeiros** (`/admin/barbeiros`) - CRUD de barbeiros, gestao de horarios de trabalho e bloqueios
- **Servicos** (`/admin/servicos`) - CRUD de servicos com nome, duracao e preco
- **Clientes** (`/admin/clientes`) - CRUD de clientes
- **Perfil** (`/admin/perfil`) - Editar dados da barbearia

## Fluxo de Agendamento (Cliente)

1. Cliente acessa a pagina publica da barbearia
2. Escolhe um servico e clica em "Agendar"
3. Se nao estiver logado, e redirecionado para login/cadastro
4. Seleciona o barbeiro desejado
5. Escolhe data e horario disponivel
6. Confirma os dados do agendamento
7. Agendamento criado com status `PRE_AGENDADO`

## Autenticacao

O sistema utiliza JWT com dois papeis:

- **cliente** - Acessa area publica e seus proprios agendamentos
- **admin** - Acessa painel administrativo da barbearia

O token e armazenado em `localStorage` e enviado automaticamente via interceptor do Axios. Ao receber um 401, o usuario e deslogado e redirecionado.

## Servicos da API

| Modulo | Descricao |
|---|---|
| `publicApi` | Listagem de barbearias, barbeiros, servicos e horarios (sem autenticacao) |
| `authApi` | Login, registro e verificacao de sessao |
| `clienteApi` | Agendamentos do cliente (criar, listar, cancelar) |
| `adminApi` | Gestao completa da barbearia (barbeiros, servicos, clientes, agendamentos, perfil) |

## Proxy de Desenvolvimento

O Vite esta configurado com proxy para redirecionar chamadas `/api` ao backend:

```js
// vite.config.js
server: {
  proxy: {
    '/api': {
      target: process.env.VITE_API_TARGET || 'http://localhost:3000',
      changeOrigin: true,
    }
  }
}
```

## Docker

O frontend pode rodar via Docker Compose em desenvolvimento:

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up
```

Em producao, o build estatico e servido pelo Nginx (ver `nginx.conf`).
