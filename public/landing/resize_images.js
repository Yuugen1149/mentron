
const Jimp = require('jimp');
const fs = require('fs');
const path = require('path');

const baseDir = 'IMAGES/Images';
const outDir = 'IMAGES/Optimized';

if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
}

fs.readdir(baseDir, (err, files) => {
    if (err) return console.error(err);

    files.forEach((file) => {
        const filePath = path.join(baseDir, file);
        const outPath = path.join(outDir, file);

        // Only process if it's a file and image
        if (ensureIsDirectory(filePath)) return;
        if (!file.match(/\.(jpg|jpeg|png)$/i)) return;

        console.log(`Optimizing: ${file} -> ${outDir}`);
        Jimp.read(filePath)
            .then((image) => {
                // Resize logic
                return image
                    .resize(800, Jimp.AUTO)
                    .quality(80)
                    .writeAsync(outPath);
            })
            .then(() => console.log(`Done: ${file}`))
            .catch((err) => {
                console.error(`Error ${file}:`, err);
                // If resize fails, try manual copy?
                try { fs.copyFileSync(filePath, outPath); } catch (e) { console.error('Copy failed too', e); }
            });
    });
});

function ensureIsDirectory(filepath) {
    try { return fs.lstatSync(filepath).isDirectory(); } catch { return false; }
}
