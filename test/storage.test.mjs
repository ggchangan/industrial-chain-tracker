import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createObjectStorage, objectKeyFromUrl } from "../server/object-storage.mjs";
import { createStateStore } from "../server/state-store.mjs";

test("file state store persists normalized content state", async () => {
  const dataDir = await mkdtemp(path.join(os.tmpdir(), "chain-state-store-"));
  const store = await createStateStore({ driver: "file", dataDir });
  await store.initialize();
  const initial = await store.load();
  assert.deepEqual(initial.researchPackagesByChain, {});
  initial.researchPackagesByChain.pcb = [{ packageId: "pcb-test" }];
  await store.save(initial);
  const reloaded = await store.load();
  assert.equal(reloaded.researchPackagesByChain.pcb[0].packageId, "pcb-test");
  await rm(dataDir, { recursive: true, force: true });
});

test("local object storage writes, reads and removes managed objects", async () => {
  const dataDir = await mkdtemp(path.join(os.tmpdir(), "chain-object-store-"));
  const storage = await createObjectStorage({ driver: "local", dataDir });
  await storage.initialize();
  const url = await storage.putObject("research/topic/article.html", Buffer.from("<h1>研究</h1>"));
  assert.equal(url, "/managed/research/topic/article.html");
  assert.equal(objectKeyFromUrl(url), "research/topic/article.html");
  assert.equal((await storage.getObject("research/topic/article.html")).toString(), "<h1>研究</h1>");
  await storage.deleteObject("research/topic/article.html");
  await assert.rejects(() => storage.getObject("research/topic/article.html"), { code: "ENOENT" });
  await rm(dataDir, { recursive: true, force: true });
});

test("COS driver fails clearly until its implementation is enabled", async () => {
  const storage = await createObjectStorage({
    driver: "cos",
    secretId: "id",
    secretKey: "secret",
    region: "ap-shanghai",
    bucket: "bucket-123"
  });
  await assert.rejects(() => storage.initialize(), /COS 驱动接口已预留/);
});
