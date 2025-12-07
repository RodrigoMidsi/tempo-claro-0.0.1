# TEMPO-CLARO 🕐
**Um gerenciador de rotinas estruturadas com sincronização ao Google Calendar**

---

## 📋 Visão Geral

TEMPO-CLARO é uma aplicação web que transforma a forma como você organiza suas rotinas diárias. Em vez de gerenciar tarefas soltas, você cria **rotinas estruturadas** com período definido (data início/fim), adiciona tarefas com horários específicos e sincroniza tudo automaticamente com seu Google Calendar.

## 🏗️ Arquitetura do Sistema

```
Dashboard (Login com Google)
    ↓
Página de Rotinas (substitui Kanban)
    ├─ Criar formulário do zero
    ├─ Criar Nova Rotina
    ├─ Editar Rotina
    └─ Exportar para Google Calendar
```

---

## 📝 Como Funciona: Passo a Passo

### **Fase 1: Criação da Rotina**

1. Usuário clica em "Nova Rotina"
2. Preenche informações básicas:
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

**Exemplo de Rotina Matinal:**
```
Rotina: "Rotina Matinal"
Período: 01/01/2025 até 31/01/2025

Tarefa 1: Exercício físico
├─ Horário: 07:00 - 07:45
└─ Dias: Todos os dias

Tarefa 2: Tomar café da manhã
├─ Horário: 07:45 - 08:15
└─ Dias: Todos os dias

Tarefa 3: Preparar para trabalho
├─ Horário: 08:15 - 09:00
└─ Dias: Segunda a Sexta

Tarefa 4: Meditação
├─ Horário: 09:00 - 09:15
└─ Dias: Sábado e Domingo
```

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

5. **Feedback ao Usuário**
   - ✅ "10 eventos adicionados ao Google Calendar com sucesso"
   - 🔗 Link para abrir o Google Calendar
    📊 Resumo dos eventos criados

---

## 📊 Visualização: Dashboard de Rotinas

```
┌─────────────────────────────────────────────────────┐
│  TEMPO-CLARO › ROTINAS                              │
├─────────────────────────────────────────────────────┤
│  [+ NOVA ROTINA]  [FILTRAR]  [ORDENAR]              │
│                                                      │
│  ┌────────────────────────────────────────────────┐ │
│  │ 📅 Rotina Matinal                  01-31 jan   │ │
│  │ ✓ Ativa | 7 tarefas | 2h 30min total          │ │
│  │ ├─ 07:00 Exercício (45min)                    │ │
│  │ ├─ 07:45 Café da manhã (30min)                │ │
│  │ ├─ 08:15 Preparar (45min)                     │ │
│  │ └─ ...                                         │ │
│  │ [✏️ Editar] [👁️ Ver] [📅 Exportar] [🗑️ Delete]  │ │
│  └────────────────────────────────────────────────┘ │
│                                                      │
│  ┌────────────────────────────────────────────────┐ │
│  │ 📅 Rotina de Trabalho              01-31 jan   │ │
│  │ ✓ Ativa | 5 tarefas | 8h total                │ │
│  │ [Ações...]                                     │ │
│  └────────────────────────────────────────────────┘ │
│                                                      │
└─────────────────────────────────────────────────────┘
```

**Ações Disponíveis para Cada Rotina:**
- ✏️ **Editar** - Modificar tarefas e datas
- 👁️ **Visualizar** - Ver timeline completa
- 📅 **Exportar para Google Calendar** - Sincronizar eventos
- 🗑️ **Arquivar/Deletar** - Remover rotina

---

## 🔄 Comparação: Kanban vs Sistema de Rotinas

| Aspecto | Kanban Atual | Novo Sistema |
|---------|-------------|--------------|
| **Objetivo** | Tarefas soltas em colunas | Rotinas estruturadas com período |
| **Agrupamento** | Por status (A fazer, Fazendo, Feito) | Por período temporal (início-fim) |
| **Tarefas** | Sem horário específico | Com horário início/fim |
| **Recorrência** | Não trata | Diária, semanal, mensal |
| **Google Calendar** | Não sincroniza | Sincroniza automaticamente |
| **Uso ideal** | Projetos simples | Rotinas e hábitos diários |

---


---

## 🚀 Implementação em Fases

### **Fase 1: MVP (Mínimo Viável)** ✅
- ✅ Formulário de criar rotina
- ✅ Adicionar tarefas dinamicamente
- ✅ Exportar para Google Calendar


---

## 📱 Fluxo Completo do Usuário

```
1. Usuário clica em "Rotinas" no menu
   ↓
2. Vê lista de rotinas existentes
   ↓
3. Clica em "+ Nova Rotina"
   ↓
4. Preenche nome, datas, tipo de recorrência
   ↓
5. Clica em "Adicionar Tarefa"
   ↓
6. Preenche título, horários, dias da semana
   ↓
7. Repete passo 5-6 para todas as tarefas
   ↓
8. Clica em "Visualizar Rotina"
   ↓
9. Revisa timeline das tarefas
   ↓
10. Clica em "Salvar Rotina"
   ↓
11. Vê rotina na lista
   ↓
12. Clica em "Exportar para Google Calendar"
   ↓
   ↓13. Autoriza acesso ao Google (já é autorizada no login)

14. Vê confirmação de eventos criados
   ↓
15. Abre link de Google Calendar para verificar
```

---

## 🛠️ Tecnologias Utilizadas

- **Frontend**: React 19.2.0 + Vite
- **Roteamento**: React Router DOM 7.0.0
- **Autenticação**: Google OAuth 2.0
- **API**: Google Calendar API
- **Armazenamento Local**: localStorage
- **Estilos**: CSS3 com design responsivo

---

## 📦 Estrutura do Projeto

```
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
```
 
