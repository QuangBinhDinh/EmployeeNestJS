import { execSync } from 'child_process';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

dotenv.config();

async function importDatabase() {
  const containerName = 'employee-mysql';
  const dbUser = process.env.DB_USER || 'nhsvlocal';
  const dbPassword = process.env.DB_PASSWORD || 'Nhsv2025';
  const dbName = process.env.DB_NAME || 'employees';

  // Import directory
  const importDir = path.join(__dirname, '../../output/import');

  // Create import directory if it doesn't exist
  if (!fs.existsSync(importDir)) {
    fs.mkdirSync(importDir, { recursive: true });
  }

  // Get list of SQL files
  const sqlFiles = fs
    .readdirSync(importDir)
    .filter((file) => file.endsWith('.sql'))
    .map((file) => path.join(importDir, file));

  // Check if any SQL files exist
  if (sqlFiles.length === 0) {
    console.log('❌ No SQL files found in output/import/');
    console.log('   Please place your SQL backup files in the output/import/ folder');
    process.exit(1);
  }

  // Display available SQL files
  console.log('📁 Available SQL files in output/import/:\n');
  sqlFiles.forEach((file, index) => {
    const stats = fs.statSync(file);
    const filesize = (stats.size / 1024).toFixed(2);
    const filename = path.basename(file);
    console.log(`  [${index + 1}] ${filename} (${filesize} KB)`);
  });

  // Prompt for selection
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question(`\nSelect file number to import (1-${sqlFiles.length}): `, (answer) => {
    const selection = parseInt(answer);

    // Validate selection
    if (isNaN(selection) || selection < 1 || selection > sqlFiles.length) {
      console.log('❌ Invalid selection');
      rl.close();
      process.exit(1);
    }

    // Get selected file
    const selectedFile = sqlFiles[selection - 1];
    const filename = path.basename(selectedFile);

    try {
      console.log(`\nImporting database from: ${filename}...`);

      // Read SQL file content
      const sqlContent = fs.readFileSync(selectedFile, 'utf-8');

      // Execute mysql via docker exec
      const command = `docker exec -i ${containerName} mysql -u ${dbUser} -p${dbPassword} ${dbName}`;
      execSync(command, {
        input: sqlContent,
        encoding: 'utf-8',
      });

      console.log('✅ Import successful');
      rl.close();
      process.exit(0);
    } catch (error) {
      console.error('❌ Import failed. Make sure Docker container is running: docker ps');
      console.error(error.message);
      rl.close();
      process.exit(1);
    }
  });
}

importDatabase();
