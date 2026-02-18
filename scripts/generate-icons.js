/**
 * Script para gerar ícones PWA a partir do logo.svg
 * 
 * Instale as dependências necessárias:
 * npm install --save-dev sharp
 * 
 * Execute: node scripts/generate-icons.js
 */

const fs = require('fs');
const path = require('path');

// Tamanhos de ícones necessários para PWA
const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];

// SVG base baseado no logo.svg
const iconSVG = `<svg width="512" height="512" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="100" height="100" rx="22" fill="#6366f1"/>
  <path d="M30 40C30 36.6863 32.6863 34 36 34H64C67.3137 34 70 36.6863 70 40V64C70 67.3137 67.3137 70 64 70H36C32.6863 70 30 67.3137 30 64V40Z" stroke="white" stroke-width="5"/>
  <path d="M30 46H70" stroke="white" stroke-width="5"/>
  <rect x="40" y="30" width="4" height="8" rx="2" fill="white"/>
  <rect x="56" y="30" width="4" height="8" rx="2" fill="white"/>
</svg>`;

async function generateIcons() {
  try {
    // Verificar se sharp está instalado
    let sharp;
    try {
      sharp = require('sharp');
    } catch (error) {
      console.error('❌ Erro: sharp não está instalado.');
      console.log('\n📦 Para instalar, execute:');
      console.log('   npm install --save-dev sharp\n');
      console.log('💡 Alternativa: Use uma ferramenta online como:');
      console.log('   https://realfavicongenerator.net/');
      console.log('   https://www.pwabuilder.com/imageGenerator\n');
      process.exit(1);
    }

    const publicDir = path.join(process.cwd(), 'public');
    
    console.log('🎨 Gerando ícones PWA...\n');

    for (const size of iconSizes) {
      const outputPath = path.join(publicDir, `icon-${size}x${size}.png`);
      
      // Criar um buffer SVG escalado
      const svgBuffer = Buffer.from(
        iconSVG.replace('width="512"', `width="${size}"`)
               .replace('height="512"', `height="${size}"`)
      );

      await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toFile(outputPath);

      console.log(`✅ Criado: icon-${size}x${size}.png`);
    }

    console.log('\n✨ Todos os ícones foram gerados com sucesso!');
    console.log('📁 Localização: public/icon-*.png\n');
  } catch (error) {
    console.error('❌ Erro ao gerar ícones:', error.message);
    process.exit(1);
  }
}

generateIcons();

