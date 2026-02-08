import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const imagesDir = path.join(root, "public", "images");
const widths = [640, 1200];
const quality = 75;

const files = fs.readdirSync(imagesDir);
const targets = files.filter((file) => /\.(jpe?g)$/i.test(file));

const ensureWebp = async (file) => {
  const inputPath = path.join(imagesDir, file);
  const base = file.replace(/\.(jpe?g)$/i, "");

  for (const width of widths) {
    const outputName = `${base}-${width}.webp`;
    const outputPath = path.join(imagesDir, outputName);
    if (fs.existsSync(outputPath)) continue;

    await sharp(inputPath)
      .resize({ width, withoutEnlargement: true })
      .webp({ quality })
      .toFile(outputPath);
  }
};

const run = async () => {
  for (const file of targets) {
    await ensureWebp(file);
  }
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
