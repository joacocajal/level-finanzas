// ============================================================
// Script para limpiar LocalStorage de LEVEL Finanzas
// Ejecutá este script en la consola del navegador (F12)
// ============================================================

console.log('🧹 Limpiando LocalStorage de LEVEL Finanzas...');

// Claves usadas por la app
const keys = [
  'level_transacciones',
  'level_inventario',
  'level_config',
  'level_initialized'
];

// Eliminar cada clave
keys.forEach(key => {
  localStorage.removeItem(key);
  console.log(`✅ Eliminado: ${key}`);
});

console.log('🎉 LocalStorage limpiado completamente. Recargá la app para reiniciar con los datos del seed.');
