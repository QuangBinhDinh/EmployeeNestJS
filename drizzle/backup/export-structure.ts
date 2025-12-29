import { execSync } from 'child_process';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

async function exportStructure() {
  const containerName = 'employee-mysql';
  const dbUser = process.env.DB_USER || 'nhsvlocal';
  const dbPassword = process.env.DB_PASSWORD || 'Nhsv2025';
  const dbName = process.env.DB_NAME || 'employees';

  // Create export directory
  const exportDir = path.join(__dirname, '../../output/export');
  if (!fs.existsSync(exportDir)) {
    fs.mkdirSync(exportDir, { recursive: true });
  }

  // Generate timestamp
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').replace('T', '_').split('.')[0];
  const outputFile = path.join(exportDir, `${dbName}_structure_${timestamp}.sql`);

  try {
    console.log(`Exporting database structure: ${dbName}...`);

    // Execute mysqldump via docker exec (structure only)
    const command = `docker exec ${containerName} mysqldump -u ${dbUser} -p${dbPassword} --no-tablespaces --no-data ${dbName}`;
    const result = execSync(command, { encoding: 'utf-8' });

    // Write to file
    fs.writeFileSync(outputFile, result);

    console.log(`✅ Export successful: ${path.relative(process.cwd(), outputFile)}`);
  } catch (error) {
    console.error('❌ Export failed. Make sure Docker container is running: docker ps');
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

exportStructure();
