#!/usr/bin/env node
import fs from 'fs-extra';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function init() {
    const projectName = process.argv[2];

    if (!projectName) {
        console.error('❌ Please provide a project name:');
        console.log('   npx create-faisanbridge-app my-new-web');
        process.exit(1);
    }

    const targetDir = path.join(process.cwd(), projectName);

    if (await fs.pathExists(targetDir)) {
        console.error(`❌ The folder ${projectName} already exists.`);
        process.exit(1);
    }

    console.log(`\n🏗️  Creating a new Faisan Bridge project...\n`);

    const templateDir = path.join(__dirname, '..', 'base');

    try {
        if (await fs.pathExists(templateDir)) {
            await fs.copy(templateDir, targetDir);
        } else {
            await fs.ensureDir(path.join(targetDir, 'src/pages/home'));
            await fs.ensureDir(path.join(targetDir, 'components'));
        }

        const finalPackageJson = {
            name: projectName,
            version: "1.0.0",
            type: "module",
            scripts: {
                "remote": "faisanbridge remote",
                "fetch": "faisanbridge fetch",
                "merge": "faisanbridge merge",
                "push": "faisanbridge push",
                "build": "faisanbridge build",
                "status": "faisanbridge status",
                "abort": "faisanbridge abort",
            },
            dependencies: {
                "faisanbridge": "latest"
            }
        };

        await fs.writeJson(path.join(targetDir, 'package.json'), finalPackageJson, { spaces: 2 });

        const envExample = `FAISAN_PUBLIC_KEY=your_public_key\nFAISAN_SECRET_KEY=your_secret_key\nWORDPRESS_URL=https://yoursite.com`;
        await fs.writeFile(path.join(targetDir, '.env.example'), envExample);

        if (!await fs.pathExists(path.join(targetDir, '.env'))) {
            await fs.writeFile(path.join(targetDir, '.env'), envExample);
        }

        if (await fs.pathExists(path.join(targetDir, 'gitignore'))) {
            await fs.rename(path.join(targetDir, 'gitignore'), path.join(targetDir, '.gitignore')).catch(() => { });
        }

    } catch (err) {
        console.error('❌ Error initializing project:', err);
        process.exit(1);
    }

    // 4. Install dependencies
    console.log("📦 Installing faisanbridge...");
    try {
        execSync(`npm install`, {
            cwd: targetDir,
            stdio: 'inherit'
        });
    } catch (e) {
        console.warn("⚠️  Dependencies could not be installed automatically. Run 'npm install' manually.");
    }

    console.log(`\n✅ Success! Project ${projectName} is ready.`);
    console.log(`\nNext steps:`);
    console.log(`   1. cd ${projectName}`);
    console.log(`   2. Configure your keys in the .env file`);
    console.log(`   3. npm run fetch`);
}

init();