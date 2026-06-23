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
  assert.deepEqual(initial.monitorVerificationsByChain, {});
  initial.researchPackagesByChain.pcb = [{ packageId: "pcb-test" }];
  initial.monitorVerificationsByChain.pcb = [{ id: "verification-test" }];
  await store.save(initial);
  const reloaded = await store.load();
  assert.equal(reloaded.researchPackagesByChain.pcb[0].packageId, "pcb-test");
  assert.equal(reloaded.monitorVerificationsByChain.pcb[0].id, "verification-test");
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

test("COS driver reads, writes and removes objects through the Tencent SDK contract", async () => {
  const calls = [];
  const client = {
    putObject(params, callback) {
      calls.push(["put", params]);
      callback(null, { ETag: "test" });
    },
    getObject(params, callback) {
      calls.push(["get", params]);
      callback(null, { Body: Buffer.from("cos-data") });
    },
    deleteObject(params, callback) {
      calls.push(["delete", params]);
      callback(null, {});
    }
  };
  const storage = await createObjectStorage({
    driver: "cos",
    secretId: "id",
    secretKey: "secret",
    region: "ap-shanghai",
    bucket: "bucket-123",
    publicBaseUrl: "https://bucket-123.cos.ap-shanghai.myqcloud.com",
    client
  });
  await storage.initialize();
  assert.equal(
    await storage.putObject("research/article.html", Buffer.from("data")),
    "/managed/research/article.html"
  );
  assert.equal((await storage.getObject("research/article.html")).toString(), "cos-data");
  await storage.deleteObject("research/article.html");
  assert.deepEqual(calls.map(([name]) => name), ["put", "get", "delete"]);
  assert.equal(
    storage.keyFromUrl("https://bucket-123.cos.ap-shanghai.myqcloud.com/research/article.html"),
    "research/article.html"
  );
});
