**Projeto de desenvolvimento front-end: TEMPO-CLARO**

Aluno: Rodrigo Miranda da Silva
Professor:Rafael Cunha Cardoso

## Introdução
Este projeto foi desenvolvido como atividade final da disciplina de DFE-1. Seu objetivo é
demonstrar minhas habilidades e meu domínio das principais tecnologias de front-end por meio
da criação de um site voltado à organização de rotinas. A proposta consiste em apresentar
um projeto de organização de rotinas via pagina web


## Visão Geral
TEMPO-CLARO é uma aplicação web que auxilia na forma como você organiza suas rotinas diárias. Em vez de gerenciar tarefas soltas, você cria rotinas estruturadas com período definido (data início/fim), adiciona tarefas com horários específicos e sincroniza tudo automaticamente com seu Google Calendar.


## 📝 Como Funciona: Passo a Passo

### **Fase 1: Criação da Rotina**

1. Usuário clica em "Nova Rotina"
   
3. Preenche informações básicas:
   - **Nome** (ex: "Rotina Matinal", "Semana de Trabalho")
   - **Descrição** (opcional)
   - **Data de Início** (ex: 01/01/2025)
   - **Data de Fim** (ex: 31/01/2025)
   - **Tipo de Recorrência**: Diária, Semanal, Mensal ou Uma única vez
   - **Cor** (para identificação visual)

### **Fase 2: Adicionar Tarefas**

Para cada tarefa, o usuário define:
- **Título** (ex: "Exercício", "Tomar café", "Estudar")
- **Descrição** (detalhes opcionais)
- **Hora de Início** (ex: 07:00)
- **Hora de Fim** (ex: 07:30)
- **Dias da Semana** (se recorrente): marcar quais dias a tarefa se repete

### **Fase 3: Revisão Visual**

Antes de salvar, o usuário vê:
- **Timeline Visual**: Tarefas em ordem de horário
- **Preview da Semana**: Distribuição das tarefas
- **Alertas de Conflitos**: Se houver sobreposição de horários
- **Duração Total**: Quanto tempo da rotina será preenchido

**Timeline de Exemplo:**
```
SEGUNDA-FEIRA
07:00 ├─ 07:45 ▓▓▓ Exercício
07:45 ├─ 08:15 ▓▓▓ Café
08:15 ├─ 09:00 ▓▓▓ Preparar
```

### **Fase 4: Salvar Rotina**

Rotina armazenada localmente com estrutura:
```javascript
Não precisa ser salva localmente, ela apenas é exportada para o Google Calendar.
```

### **Fase 5: Exportar para Google Calendar**

**Fluxo de Sincronização:**


2. **Autenticação** (primeira vez)
   - Solicitar permissão do Google Calendar (Ele já tem essa permissão do login)

3. **Processamento**
   - Para cada tarefa:
     - Se "uma única vez": criar 1 evento
     - Se "semanal": criar eventos para cada semana no período
     - Se "personalizado": seleciona os dias que quer que a tarefa seja implementada para cada dia

4. **Envio dos Eventos**
   - Exibir mensagem de sucesso/erro

## Tecnologias Utilizadas

- **Frontend**: React 19.2.0 + Vite
- **Roteamento**: React Router DOM 7.0.0
- **Autenticação**: Google OAuth 2.0
- **API**: Google Calendar API
- **Armazenamento Local**: localStorage
- **Estilos**: CSS3 com design responsivo
- 

## Estrutura do Projeto

src/
├── components/
│   ├── Auth/
│   │   └── GoogleLoginButton.jsx
│   ├── Kanban/ (será substituído por Rotinas)
│   └── ...
├── context/
│   └── AuthContext.jsx
├── manager/
│   ├── loginManager.js
│   ├── dashboardManager.js
│   ├── routineManager.js (novo)
│   └── ...
├── pages/
│   ├── LoginPage.jsx
│   ├── DashboardPage.jsx
│   └── RoutinePage.jsx (novo)
├── styles/
│   └── ...
└── ...

 ## Arquitetura do Sistema


Dashboard (Login com Google)
    ↓
Página de Rotinas (substitui Kanban)
    ├─ Criar formulário do zero
    ├─ Criar Nova Rotina
    ├─ Editar Rotina
    └─ Exportar para Google Calendar

