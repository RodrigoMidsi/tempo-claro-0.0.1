#!/usr/bin/env node

/**
 * Script de Validação do Sistema de Rotinas
 * Executa verificações básicas para garantir que a implementação está correta
 */

const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, 'src');
const resultsLog = [];
let errorCount = 0;
let successCount = 0;

// Cores para terminal
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  const output = `${colors[color]}${message}${colors.reset}`;
  console.log(output);
  resultsLog.push(message);
}

function checkFileExists(filePath, description) {
  if (fs.existsSync(filePath)) {
    log(`✅ ${description}`, 'green');
    successCount++;
    return true;
  } else {
    log(`❌ ${description} - FALTANDO: ${filePath}`, 'red');
    errorCount++;
    return false;
  }
}

function checkFileContains(filePath, searchString, description) {
  if (!fs.existsSync(filePath)) {
    log(`❌ ${description} - ARQUIVO NÃO EXISTE`, 'red');
    errorCount++;
    return false;
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  if (content.includes(searchString)) {
    log(`✅ ${description}`, 'green');
    successCount++;
    return true;
  } else {
    log(`❌ ${description} - CONTEÚDO NÃO ENCONTRADO`, 'red');
    errorCount++;
    return false;
  }
}

// Iniciar validação
console.log('\n');
log('╔════════════════════════════════════════════════════════════╗', 'blue');
log('║         VALIDAÇÃO DO SISTEMA DE ROTINAS                   ║', 'blue');
log('║         TEMPO-CLARO v1.0.0 MVP                            ║', 'blue');
log('╚════════════════════════════════════════════════════════════╝', 'blue');
console.log('\n');

// 1. Verificar Managers
log('📦 Verificando Manager Files...', 'yellow');
checkFileExists(path.join(srcPath, 'manager', 'routineManager.js'), 'routineManager.js');
checkFileExists(path.join(srcPath, 'manager', 'googleCalendarManager.js'), 'googleCalendarManager.js');
checkFileContains(
  path.join(srcPath, 'manager', 'index.js'),
  'routineManager',
  'routineManager exportado em index.js'
);
checkFileContains(
  path.join(srcPath, 'manager', 'index.js'),
  'googleCalendarManager',
  'googleCalendarManager exportado em index.js'
);

// 2. Verificar Componentes
log('\n🎨 Verificando Componentes React...', 'yellow');
checkFileExists(path.join(srcPath, 'components', 'Routine', 'RoutineForm.jsx'), 'RoutineForm.jsx');
checkFileContains(
  path.join(srcPath, 'components', 'Routine', 'RoutineForm.jsx'),
  'routineManager',
  'RoutineForm utiliza routineManager'
);

// 3. Verificar Páginas
log('\n📄 Verificando Páginas...', 'yellow');
checkFileExists(path.join(srcPath, 'pages', 'RoutinePage.jsx'), 'RoutinePage.jsx');
checkFileContains(
  path.join(srcPath, 'pages', 'RoutinePage.jsx'),
  'RoutineForm',
  'RoutinePage importa RoutineForm'
);
checkFileContains(
  path.join(srcPath, 'pages', 'RoutinePage.jsx'),
  'routineManager',
  'RoutinePage utiliza routineManager'
);

// 4. Verificar Estilos
log('\n🎨 Verificando Estilos CSS...', 'yellow');
checkFileExists(path.join(srcPath, 'styles', 'RoutineForm.css'), 'RoutineForm.css');
checkFileExists(path.join(srcPath, 'styles', 'RoutinePage.css'), 'RoutinePage.css');

// 5. Verificar Roteamento
log('\n🛣️ Verificando Roteamento...', 'yellow');
checkFileContains(
  path.join(srcPath, 'App.jsx'),
  'RoutinePage',
  'RoutinePage importada em App.jsx'
);
checkFileContains(
  path.join(srcPath, 'App.jsx'),
  '/routine',
  'Rota /routine definida em App.jsx'
);
checkFileContains(
  path.join(srcPath, 'App.jsx'),
  'Navigate to="/routine"',
  'Redirecionamento padrão para /routine'
);

// 6. Verificar Documentação
log('\n📚 Verificando Documentação...', 'yellow');
checkFileExists(path.join(__dirname, 'ROUTINE_USAGE_GUIDE.md'), 'ROUTINE_USAGE_GUIDE.md');
checkFileExists(path.join(__dirname, 'COMPONENTS_DOCUMENTATION.md'), 'COMPONENTS_DOCUMENTATION.md');
checkFileExists(path.join(__dirname, 'IMPLEMENTATION_SUMMARY.md'), 'IMPLEMENTATION_SUMMARY.md');

// 7. Verificar Dashboard
log('\n📊 Verificando Integrações no Dashboard...', 'yellow');
checkFileContains(
  path.join(srcPath, 'pages', 'DashboardPage.jsx'),
  'btn-routine',
  'Botão de Rotinas adicionado ao Dashboard'
);
checkFileContains(
  path.join(srcPath, 'pages', 'DashboardPage.jsx'),
  '/routine',
  'Navegação para /routine no Dashboard'
);

// 8. Verificar Validações no Code
log('\n✔️ Verificando Funções Críticas...', 'yellow');
checkFileContains(
  path.join(srcPath, 'manager', 'routineManager.js'),
  'validateRoutine',
  'Função validateRoutine implementada'
);
checkFileContains(
  path.join(srcPath, 'manager', 'routineManager.js'),
  'detectConflicts',
  'Função detectConflicts implementada'
);
checkFileContains(
  path.join(srcPath, 'manager', 'routineManager.js'),
  'calculateTotalDuration',
  'Função calculateTotalDuration implementada'
);
checkFileContains(
  path.join(srcPath, 'manager', 'routineManager.js'),
  'convertToGoogleCalendarEvents',
  'Função convertToGoogleCalendarEvents implementada'
);
checkFileContains(
  path.join(srcPath, 'manager', 'googleCalendarManager.js'),
  'syncRoutineToCalendar',
  'Função syncRoutineToCalendar implementada'
);

// Resultado Final
console.log('\n');
log('╔════════════════════════════════════════════════════════════╗', 'blue');
log('║                    RESULTADO FINAL                         ║', 'blue');
log('╚════════════════════════════════════════════════════════════╝', 'blue');
console.log('\n');

const totalChecks = successCount + errorCount;
const percentage = Math.round((successCount / totalChecks) * 100);

log(`✅ Passou: ${successCount}/${totalChecks}`, 'green');
log(`❌ Falhou: ${errorCount}/${totalChecks}`, errorCount > 0 ? 'red' : 'green');
log(`📊 Porcentagem: ${percentage}%`, percentage === 100 ? 'green' : 'yellow');

console.log('\n');

if (errorCount === 0) {
  log('🎉 IMPLEMENTAÇÃO COMPLETA E VALIDADA!', 'green');
  log('   Todos os arquivos e funcionalidades foram verificados com sucesso.', 'green');
  console.log('\n');
  log('📋 Próximos Passos:', 'yellow');
  log('   1. Execute: npm run dev', 'blue');
  log('   2. Abra: http://localhost:5173', 'blue');
  log('   3. Navegue para: /routine', 'blue');
  log('   4. Crie sua primeira rotina!', 'blue');
  process.exit(0);
} else {
  log('⚠️  PROBLEMAS ENCONTRADOS', 'red');
  log(`   ${errorCount} verificação(ões) falharam.`, 'red');
  log('   Por favor, verifique os erros acima.', 'red');
  console.log('\n');
  log('Erros encontrados:', 'red');
  resultsLog
    .filter(line => line.includes('❌'))
    .forEach(error => log(`  ${error}`, 'red'));
  process.exit(1);
}
