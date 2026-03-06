import fs from 'fs';
import path from 'path';

const searchPath = 'C:\\redeimoveis\\src\\app\\api';
const targetRegex = /['"](\.\.\/)+auth\/\[\.\.\.nextauth\]\/route['"]/g;
const replacement = "'@/lib/auth'";

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

walkDir(searchPath, (filePath) => {
    if (filePath.endsWith('.ts') || filePath.endsWith('.tsx') || filePath.endsWith('.js') || filePath.endsWith('.jsx')) {
        const content = fs.readFileSync(filePath, 'utf8');
        // Also fix the botched ones like "../@/lib/auth"
        const botchedRegex = /['"](\.\.\/)+@\/lib\/auth['"]/g;

        let newContent = content.replace(targetRegex, replacement);
        newContent = newContent.replace(botchedRegex, replacement);

        if (newContent !== content) {
            console.log(`Fixing: ${filePath}`);
            fs.writeFileSync(filePath, newContent);
        }
    }
});
