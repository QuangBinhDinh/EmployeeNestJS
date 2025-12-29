import * as fs from 'fs';
import * as path from 'path';

async function runAllSeeds() {
  console.log('🌱 Starting database seeding...\n');

  try {
    // Get all seed files matching pattern seed-*.ts
    const seedDir = __dirname;
    const seedFiles = fs
      .readdirSync(seedDir)
      .filter((file) => file.startsWith('seed-') && file.endsWith('.ts'))
      .sort(); // Sort alphabetically for consistent ordering

    if (seedFiles.length === 0) {
      console.log('⚠️  No seed files found matching pattern seed-*.ts');
      process.exit(0);
    }

    console.log(`📝 Found ${seedFiles.length} seed file(s): ${seedFiles.join(', ')}\n`);

    // Run each seed file
    for (const seedFile of seedFiles) {
      const seedModule = await import(path.join(seedDir, seedFile));

      // Get the default export or the named export function
      const seedFunction = seedModule.default || Object.values(seedModule)[0];

      if (typeof seedFunction === 'function') {
        console.log(`🌱 Running ${seedFile}...`);
        await seedFunction();
        console.log('');
      } else {
        console.warn(`⚠️  ${seedFile} does not export a function`);
      }
    }

    console.log('✅ All seeds completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

runAllSeeds();
