# Fordox - Plataforma de Monitoramento Agroindustrial

Sistema completo de monitoramento em tempo real para produtores e frigoríficos, integrando sensores IoT, dados meteorológicos e gestão animal. Desenvolvido com React, TypeScript, Supabase e Tailwind CSS.

## Funcionalidades

- **Dashboard em tempo real:** Visualização de métricas ambientais, consumo, alertas e status do sistema.
- **Gestão Animal:** Controle de rebanho, saúde, localização e histórico de alimentação.
- **Relatórios e Análises:** Geração de PDFs, compliance, rastreabilidade e análises de conversão alimentar.
- **Alertas inteligentes:** Notificações críticas, avisos e informativos com configuração de limites.
- **Configurações do sistema:** Integração com APIs meteorológicas, teste de conexão com banco de dados e personalização de limites de alerta.
- **Autenticação:** Login via Supabase Auth (Google e e-mail).

## Estrutura do Projeto

```
.env
.env.example
src/
  App.tsx
  main.tsx
  index.css
  components/
    Dashboard.tsx
    AnimalManagement.tsx
    Reports.tsx
    Alerts.tsx
    Settings.tsx
    Sidebar.tsx
    Header.tsx
    MetricCard.tsx
    AlertBanner.tsx
    ConversionChart.tsx
    EnvironmentChart.tsx
  lib/
    supabase.ts
supabase/
  functions/
    get-app-configs/
    update-app-configs/
    get-sensor-data/
    get-weather-data/
    test-db-connection/
  migrations/
    20250815142531_floating_pine.sql
```

## Instalação

1. **Clone o repositório:**
   ```sh
   git clone <url-do-repo>
   cd FordoxBoltV2/project
   ```

2. **Configure o ambiente:**
   - Copie `.env.example` para `.env` e preencha com suas credenciais do Supabase e PostgreSQL.

3. **Instale as dependências:**
   ```sh
   npm install
   ```

4. **Inicie o servidor de desenvolvimento:**
   ```sh
   npm run dev
   ```

## Configuração do Supabase

- Crie um projeto no [Supabase](https://supabase.com).
- Configure as variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` no `.env`.
- Execute as migrações SQL em `supabase/migrations/` para criar as tabelas necessárias.
- Implemente as Edge Functions copiando os arquivos de `supabase/functions/` para o painel do Supabase.

## Scripts

- `npm run dev` — Inicia o ambiente de desenvolvimento.
- `npm run build` — Gera o build de produção.
- `npm run lint` — Executa o linter.
- `npm run preview` — Visualiza o build de produção localmente.

## Tecnologias

- **React + TypeScript**
- **Supabase** (Auth, Edge Functions, Database)
- **Tailwind CSS**
- **Lucide React** (ícones)
- **Vite** (bundler)

## Licença

Este projeto é privado e para uso interno Fordox.

---

> Para dúvidas, consulte os arquivos de configuração ou entre em contato com o administrador do projeto.

# Documentação da Aplicação Fordox - Plataforma de Monitoramento

Esta documentação consolida a arquitetura, fluxo de dados, infraestrutura, decisões de projeto e pontos estratégicos da aplicação **Fordox**.  
O objetivo é fornecer uma visão unificada e clara para desenvolvedores, stakeholders e técnicos envolvidos no projeto.

---

## 1. Visão Geral da Arquitetura

A aplicação **Fordox** é uma plataforma de monitoramento em tempo real para granjas, frigoríficos e ambientes agropecuários.  
Ela é construída com **React (Vite)** no frontend, **Supabase** como BaaS e um **PostgreSQL externo** para dados de sensores.

**Componentes Principais:**
- **Frontend (React/Vite + Tailwind)**: Interface do usuário para visualização de métricas, configurações e alertas.
- **Supabase**:
  - **Autenticação**: Login e sessão dos usuários.
  - **Banco interno (PostgreSQL)**: Armazena configurações (`app_configs`) e alertas (`alerts` - planejado).
  - **Edge Functions (Deno)**: Camada de API para comunicação entre frontend, PostgreSQL externo e APIs de terceiros.
- **PostgreSQL Externo**: Armazena os dados brutos dos sensores (temperatura, umidade, energia, água, ração, peso etc.).
- **APIs de Terceiros**: OpenWeatherMap para dados climáticos.

```
+-------------------+       +---------------------+       +---------------------+
|    Frontend       |       |   Supabase          |       |  PostgreSQL Externo |
| (React/Vite)      |       |                     |       |  (Dados Sensores)   |
+---------+---------+       | +-----------------+ |       +----------+----------+
          |                   | | Auth            | |                  |
          |                   | | Database        | |                  |
          |                   | | Edge Functions  | |                  |
          +-------------------> | (get-sensor-data)|<-------------------+
          |                   +-------------------+ | (Sensor Data)
          |                               |
          |                               +-------------------> OpenWeatherMap
```

---

## 2. Conexões com Banco de Dados

### 2.1. Supabase (Interno)
- **Funções**: Autenticação, configurações globais e alertas.
- **Credenciais**:
  - Frontend: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
  - Edge Functions: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`.
- **Tabelas**:
  - `auth.users` → Usuários autenticados.
  - `public.app_configs` → Configurações (limites de alerta, chaves de API).
  - `public.alerts` (planejado).

### 2.2. PostgreSQL Externo
- **Função**: Armazenamento dos dados brutos de sensores.
- **Credenciais**: `PGHOST`, `PGPORT`, `PGDB`, `PGUSER`, `PGPASSWORD`.
- **Tabelas Esperadas**:
  - `public.informacoes` → Leituras (id, sensor, valor, grupo, data_registro).
  - `public.sensor` → Cadastro dos sensores.
  - `public.grupo` → Localização dos sensores.

---

## 3. Fluxo de Dados e APIs

### 3.1. Dados de Sensores
- Origem: PostgreSQL externo.
- Edge Function: `get-sensor-data`.
- Funções:
  - Busca leituras recentes.
  - Calcula métricas (atual, média, mínimo, máximo).
  - Retorna agregados por tipo de sensor.
- Frontend: `Dashboard.tsx` e `EnvironmentChart.tsx`.

### 3.2. Dados Meteorológicos
- Origem: OpenWeatherMap.
- Edge Function: `get-weather-data`.
- Configuração: chave armazenada em `app_configs`.

### 3.3. Configurações da Aplicação
- Origem: `public.app_configs`.
- Edge Functions: `get-app-configs` e `update-app-configs`.
- Frontend: `Settings.tsx`.

### 3.4. Teste de Conexão ao PostgreSQL Externo
- Edge Function: `test-db-connection`.
- Função: executa `SELECT version()` e retorna status da conexão.

---

## 4. Tratamento de Informações Sensíveis

- **Desenvolvimento Local**: `.env` com variáveis (`Supabase`, `Postgres Externo`, APIs).
- **Produção**: Configurações como variáveis de ambiente no Supabase.
- **Políticas**:
  - Arquivo `.env` nunca versionado (no `.gitignore`).
  - Credenciais sensíveis isoladas em Edge Functions.
  - Chaves de APIs (ex: `weather_api_key`) armazenadas em `app_configs` e protegidas por RLS.

---

## 5. Configuração de Alertas

- **Limites**: Definidos em `app_configs` (`alert_temperature_min`, `alert_humidity_max`, etc).
- **Situação Atual**: Alertas mockados em `Alerts.tsx`.
- **Planejamento**:
  - Edge Function para inserir alertas reais em `public.alerts`.
  - Produtores poderão marcar alertas como resolvidos.
  - Níveis de alerta (emergencial, aviso, informativo).

---

## 6. Inteligência Artificial (IA)

- **Objetivo**: Cruzar dados dos **4 pilares**:
  1. Genética  
  2. Nutrição  
  3. Ambiência (temperatura, umidade, vento)  
  4. Manejo  

- **Casos de Uso**:
  - Predição de doenças a partir de padrões de alimentação e comportamento.
  - Análise de resposta a vacinação ou troca de ração.
  - Identificação precoce de problemas (ex: baixa conversão alimentar).
  - Futuro: análise de sons e imagens para insights adicionais.

---

## 7. Design e Usabilidade

### 7.1. Produtor Final
- Interface simples, mostrando:
  - Dados em tempo real.
  - Alarmes imediatos (com confirmação de leitura).
  - Histórico das últimas 24h.
  - Relatórios por período e por lote.
- Login único (sessão persistida).

### 7.2. Frigorífico
- Visão consolidada dos produtores.
- Relatórios comparativos por planta/lote.
- Acompanhamento remoto das granjas.

### 7.3. Técnicos / Veterinários
- Acesso aos dados dos produtores sob sua responsabilidade.
- Registro de visitas, observações e validação de processos.

### 7.4. Níveis de Acesso
- **Administradores** → Configuração completa.
- **Gestores (proprietários)** → Dados da própria granja.
- **Técnicos/Veterinários** → Acesso a produtores assistidos.
- **Transportadores** → Controle de entrada e saída dos lotes.

---

## 8. Organização dos Lotes

- **Definição**: Ciclo de produção de um grupo de animais (início → entrega).
- **Objetivo**: Comparar lotes e identificar melhorias ou problemas.
- **Regras**:
  - Um lote inicia quando animais chegam e encerra na saída.
  - Dados relacionados a cada lote: consumo, peso, ambiência, alertas.
  - Possibilidade de comparar entre lotes (ex: genética diferente, nutrição distinta).

---

## 9. Segurança e Confiabilidade

- **Princípio de não causar danos**:
  - Relatórios devem ser confiáveis.
  - Decisões erradas baseadas em dados incorretos podem gerar prejuízo e perda de credibilidade.
- **Riscos**:
  - Dados inconsistentes → decisões equivocadas.
  - Vazamentos → baixo impacto financeiro, mas risco de imagem.
- **Medidas**:
  - Normalização dos dados.
  - Testes de consistência antes de gravação.
  - Monitoramento contínuo da qualidade dos dados.

---

## 10. Dados e Infraestrutura

- **Sensores já coletados**: Temperatura, umidade, água, energia.
- **Em andamento**: Sensores de ração e peso.
- **Banco de dados**: PostgreSQL local com acesso remoto configurado.
- **Domínio e hospedagem**:
  - Registro em `registro.br`.
  - Hospedagem inicial em HostGator.
  - SMTP dedicado para notificações.
- **Deploy**:
  - Frontend hospedado (NGINX).
  - Edge Functions no Supabase.
  - Reuniões quinzenais (sprints) para alinhamento e evolução.

---

## 11. Próximos Passos

1. Implementação do sistema de **alertas dinâmicos** no Supabase.  
2. Criação de **gestão animal** (cadastro de animais, métricas individuais).  
3. **Normalização de dados** dos sensores já existentes.  
4. Desenvolvimento de **relatórios detalhados por lote**.  
5. Avanço em **IA preditiva** para análises comportamentais.  
6. Integrações futuras com:
   - APIs externas adicionais.
   - Sistemas de automação (gatilhos automáticos).

---

## 12. Decisões Importantes

- **Públicos-alvo**: Produtores finais e frigoríficos.  
- **IA**: Focada nos 4 pilares.  
- **Interface**: Simples para produtores, robusta para frigoríficos/técnicos.  
- **Dados**: Devem ser organizados, confiáveis e seguros.  
- **Lotes**: Unidade central de análise e comparação.  

---

📌 **Elaboração:** João Maykon e equipe Fordox  
📌 **Validação:** Time Fordox (Jun 2025)