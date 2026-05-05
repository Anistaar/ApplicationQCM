// build-admin.js
// Script pour compiler les fichiers TypeScript de l'admin et la nouvelle UI

import { build } from 'vite';
import { resolve } from 'path';

async function buildAdmin() {
  console.log('🔨 Building admin panel...');
  
  await build({
    build: {
      outDir: 'dist/admin',
      rollupOptions: {
        input: {
          admin: resolve(process.cwd(), 'src/admin/admin-panel.html')
        }
      }
    }
  });
  
  console.log('✅ Admin panel built successfully');
}

async function buildNewUI() {
  console.log('🔨 Building new UI...');
  
  await build({
    build: {
      outDir: 'dist/new-ui',
      rollupOptions: {
        input: {
          newui: resolve(process.cwd(), 'src/new-ui/index.html')
        }
      }
    }
  });
  
  console.log('✅ New UI built successfully');
}

async function main() {
  try {
    await buildAdmin();
    await buildNewUI();
    console.log('\n🎉 All builds completed!');
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

main();
