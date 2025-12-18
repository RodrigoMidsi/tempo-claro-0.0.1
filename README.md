@audit-ok 5.7 boas praticas - Documento descritivo detalhado sobre o projeto (motivações, público-alvo, tecnologias, etc.).

## **Projeto de desenvolvimento front-end: TEMPO-CLARO**

Aluno: Rodrigo Miranda da Silva

Professor:Rafael Cunha Cardoso

## Introdução
Este projeto foi desenvolvido como atividade final da disciplina de DFE-1. Seu objetivo é
demonstrar minhas habilidades e meu domínio das principais tecnologias de front-end por meio
da criação de um site voltado à organização de rotinas. A proposta consiste em apresentar
um projeto de organização de rotinas via pagina web

## Visão Geral
TEMPO-CLARO é uma aplicação web que auxilia na forma como você organiza suas rotinas diárias. Em vez de gerenciar tarefas soltas, você cria rotinas estruturadas com período definido (data início/fim), adiciona tarefas com horários específicos e sincroniza tudo automaticamente com seu Google Calendar.

## Público-alvo
Focado em um Publico geral que utiliza as ferramentas do google para se orientar, e quem necessita de uma ferramenta para gerar de forma mais automatizada suas tárefas no google agenda.

## Propósito do projeto
Desenvolvi este projeto pela minha dificuldade de organização, pensando em uma maneira facil de organizar tarefas e com um "toque" próprio eu desenvolvi o Tempo-Claro.

## Como Funciona: Passo a Passo

acesse pelo link: www.monzai.com.br e faça login com sua conta google.

***Fase 1:*** Criação da Rotina

Usuário acessa a página de Rotinas e clica em "Nova Rotina"

Preenche informações básicas:

Nome (ex: "Rotina Matinal")

Data de Início

Data de Fim

Cor (para identificação visual no sistema e no Google Agenda)

***Fase 2:*** Adicionar Tarefas

Para cada tarefa dentro da rotina, o usuário define:

Título

Hora de Início

Hora de Fim

Dias da Semana: Seleção via checkboxes (Segunda a Domingo) para definir a recorrência semanal daquela tarefa específica dentro do intervalo de datas da rotina

***Fase 3:*** Revisão Visual e Validação

Antes de salvar, o sistema oferece:

Visualização de Timeline: Um preview ordenado por horário separando as tarefas por dia da semana

Cálculo de Duração: Exibição do tempo total alocado em tarefas por dia

Validações de Lógica: Impede horários de fim anteriores ao início e exige seleção de dias

***Fase 4:*** Salvar Rotina

A rotina é armazenada no localStorage do navegador através do gerenciadorRotinas

O objeto salvo contém a estrutura completa de dados, incluindo as tarefas aninhadas e configurações de recorrência

***Fase 5:*** Exportar para Google Agenda

Fluxo de Sincronização:

Verificação de Token: O sistema verifica se existe um token de acesso válido obtido no login através do AuthContext

Criação de Calendário: O sistema verifica se existe um calendário chamado "TEMPO-CLARO Rotinas" e, caso não exista, ele é criado automaticamente

Geração de Datas: O gerenciadorCalendar calcula todas as datas específicas entre a data de início e fim que correspondem aos dias da semana selecionados

Envio dos Eventos: Os eventos são inseridos na API do Google Calendar com título, horários e a cor definida na rotina

## Tecnologias Utilizadas

Frontend: React + Vite

Roteamento: React Router DOM

Autenticação: Google Identity Services (OAuth 2.0)

API: Google Calendar API (v3)

Armazenamento: localStorage (Persistência de dados) e Context API (Estado da aplicação)

Estilos: CSS3 com variáveis globais para temas claro e escuro

## Arquitetura do Sistema

***Páginas*** (src/pages/)

PaginaLogin.jsx: Gerencia a interface de autenticação, permitindo que o usuário entre no sistema via Google OAuth 2.0.

PaginaPainel.jsx: Atua como o Dashboard principal, exibindo estatísticas como o total de rotinas, tarefas diárias e tempo total alocado.

PaginaRotina.jsx: Página central de gerenciamento onde o usuário visualiza a lista de rotinas, inicia a criação/edição e realiza a exportação para o calendário.

***Componentes*** (src/components/)

FormularioRotina.jsx: Componente de formulário completo para criar ou editar rotinas, incluindo a definição de tarefas e seleção de dias da semana.

BotaoLoginGoogle.jsx: Componente reutilizável que renderiza o botão personalizado para iniciar o fluxo de login do Google.

RotaProtegida.jsx: Atua como um guarda de segurança, verificando se o usuário está autenticado antes de permitir o acesso às páginas internas.

CarregadorSpinner.jsx: Fornece um feedback visual (spinner) durante processos de carregamento de dados ou autenticação.

index.js: Arquivo de exportação centralizado que facilita a importação de componentes por outras partes do sistema.

***Manager*** (src/manager/)

gerenciadorRotinas.js: Responsável por toda a lógica de manipulação de dados locais, incluindo criação de modelos, validação, salvamento e carregamento do localStorage.

gerenciadorCalendar.js: Gerencia a integração direta com a Google Calendar API, lidando com a inicialização da API e a conversão de rotinas em eventos de agenda.

***Context*** (src/context/)

AuthContext.jsx: Gerencia o estado global de autenticação, armazenando os dados do usuário e o token de acesso necessário para as APIs do Google.

ThemeContext.jsx: Controla a preferência de tema (claro ou escuro) do usuário, aplicando as variáveis correspondentes em todo o documento.

***Estrutura Base e Estilos***

App.jsx: Define a estrutura de roteamento da aplicação e organiza os provedores de contexto globais.

main.jsx: Ponto de entrada do React que renderiza a aplicação e injeta os estilos globais.

main.css: Contém as definições de cores de estilo, variáveis de tema (claro/escuro) e estilos base da interface.

App.css: Define estilos específicos para o container principal da aplicação e animações de carregamento.

PaginaLogin.css, PaginaPainel.css, PaginaRotina.css e FormularioRotina.css: Arquivos de estilo dedicados para a organização visual de cada página e componente específico.

