import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createObjectStorage } from "../server/object-storage.mjs";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, "..");
const dataDir = path.resolve(process.env.DATA_DIR || path.join(rootDir, ".runtime-data"));

for (const name of ["COS_SECRET_ID", "COS_SECRET_KEY", "COS_REGION", "COS_BUCKET"]) {
  if (!process.env[name]) {
    console.error(`缺少 ${name}，无法迁移到腾讯云 COS。`);
    process.exit(1);
  }
}

const cos = await createObjectStorage({ driver: "cos" });
await cos.initialize();
const files = await listFiles(dataDir);
const objects = files.filter((file) =>
  path.basename(file) !== "managed-content.json" &&
  !path.basename(file).startsWith(".")
);

if (!objects.length) {
  console.error(`本地对象目录 ${dataDir} 中没有可迁移文件。`);
  process.exit(1);
}

let uploaded = 0;
for (const file of objects) {
  const key = path.relative(dataDir, file).split(path.sep).join("/");
  await cos.putObject(key, await readFile(file));
  uploaded += 1;
  console.log(`[${uploaded}/${objects.length}] ${key}`);
}
console.log(`迁移完成：${uploaded} 个对象已上传到 ${process.env.COS_BUCKET}。`);

async function listFiles(directory) {
  const output = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) output.push(...await listFiles(target));
    else if (entry.isFile()) output.push(target);
  }
  return output;
}
