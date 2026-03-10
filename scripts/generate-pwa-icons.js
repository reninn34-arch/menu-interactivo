/**
 * Generador de iconos PWA
 * 
 * Este script crea iconos PNG para la PWA con un diseño simple.
 * Los iconos se guardan en el directorio public/
 * 
 * Para ejecutar: node generate-pwa-icons.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const publicDir = path.join(__dirname, '../public');

// Función para crear SVG con el logo
function createSVG(size) {
  const padding = size * 0.15;
  const iconSize = size - (padding * 2);
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <!-- Fondo con gradiente -->
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#FF9F0A;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#FF7A00;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Fondo redondeado -->
  <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="url(#grad)"/>
  
  <!-- Icono de menú/restaurante -->
  <g transform="translate(${padding}, ${padding})">
    <!-- Plato -->
    <circle cx="${iconSize/2}" cy="${iconSize/2}" r="${iconSize * 0.35}" fill="white" opacity="0.9"/>
    <circle cx="${iconSize/2}" cy="${iconSize/2}" r="${iconSize * 0.3}" fill="none" stroke="#320A0A" stroke-width="${iconSize * 0.02}"/>
    
    <!-- Tenedor -->
    <path d="M ${iconSize * 0.35} ${iconSize * 0.25} 
             L ${iconSize * 0.35} ${iconSize * 0.5}
             M ${iconSize * 0.3} ${iconSize * 0.25}
             L ${iconSize * 0.3} ${iconSize * 0.45}
             M ${iconSize * 0.4} ${iconSize * 0.25}
             L ${iconSize * 0.4} ${iconSize * 0.45}"
          stroke="#320A0A" stroke-width="${iconSize * 0.025}" stroke-linecap="round"/>
    
    <!-- Cuchillo -->
    <path d="M ${iconSize * 0.65} ${iconSize * 0.25}
             L ${iconSize * 0.65} ${iconSize * 0.5}"
          stroke="#320A0A" stroke-width="${iconSize * 0.03}" stroke-linecap="round"/>
  </g>
</svg>`;
}

console.log('🎨 Generando iconos PWA...\n');

// Crear directorio public si no existe
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Generar cada tamaño
sizes.forEach(size => {
  const svgContent = createSVG(size);
  const filename = `icon-${size}x${size}.png`;
  const svgFilename = `icon-${size}x${size}.svg`;
  const svgPath = path.join(publicDir, svgFilename);
  
  // Guardar SVG
  fs.writeFileSync(svgPath, svgContent);
  console.log(`✅ Generado: ${svgFilename}`);
});

console.log('\n📱 Iconos SVG generados correctamente!');
console.log('\n⚠️  NOTA: Los archivos SVG se generaron correctamente.');
console.log('Para convertirlos a PNG, puedes:');
console.log('1. Usar una herramienta online como https://cloudconvert.com/svg-to-png');
console.log('2. Instalar imagemagick y ejecutar:');
console.log('   npm install -g imagemagick');
console.log('   convert icon-*.svg icon-*.png');
console.log('\nO puedes usar estos SVG temporalmente para probar la PWA.');
console.log('Los navegadores modernos soportan SVG en el manifest.\n');
