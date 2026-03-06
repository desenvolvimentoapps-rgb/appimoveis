import fs from 'fs';
import path from 'path';

const searchPath = 'C:\\redeimoveis\\src\\app\\api';

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

walkDir(searchPath, (filePath) => {
    if (filePath.endsWith('.ts') || filePath.endsWith('.tsx') || filePath.endsWith('.js') || filePath.endsWith('.jsx')) {
        let content = fs.readFileSync(filePath, 'utf8');
        let changed = false;

        // Pattern 1: await prisma.model.delete({ where: { id } })
        // where id comes from searchParams.get("id")
        if (content.includes('searchParams.get("id")') && content.includes('.delete({ where: { id } })')) {
            // Check if there is already an if(!id) check
            if (!content.includes('if (!id)')) {
                console.log(`Fixing missing check in: ${filePath}`);
                content = content.replace(
                    /const id = searchParams\.get\("id"\);/g,
                    'const id = searchParams.get("id");\n    if (!id) return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 });'
                );
                changed = true;
            }

            // Fix prisma delete where: { id } to where: { id: id as string } or just handle it
            // Actually if we have if(!id), TS should be fine, but sometimes it needs cast
            if (!content.includes('id: id as string')) {
                content = content.replace(/where: { id }/g, 'where: { id: id as string }');
                changed = true;
            }
        }

        if (changed) {
            fs.writeFileSync(filePath, content);
        }
    }
});
