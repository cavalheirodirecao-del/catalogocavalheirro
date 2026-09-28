const fs = require("node:fs");
const vm = require("node:vm");
const ts = require("typescript");
const assert = require("node:assert/strict");
const { test } = require("node:test");

function load(file, dependencies = {}) {
  const module = { exports: {} };
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(file, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText,
    { module, exports: module.exports, URL, require: name => dependencies[name] ?? require(name) });
  return module.exports;
}
const seo = load("src/lib/seo.ts");

test("sitemap publishes active products and published articles without private or referral URLs", async () => {
  const prisma = {
    produto: { findMany: async ({ where }) => { assert.equal(where.ativo, true); return [{ id: "item", atualizadoEm: new Date() }]; } },
    postBlog: { findMany: async ({ where }) => { assert.equal(where.publicado, true); return [{ slug: "guia jeans", atualizadoEm: new Date() }]; } },
  };
  const result = await load("src/app/sitemap.ts", { "@/lib/prisma": { prisma }, "@/lib/seo": seo }).default();
  assert(result.some(item => item.url.endsWith("/varejo/produto/item")));
  assert(result.some(item => item.url.endsWith("/blog/guia%20jeans")));
  assert(result.every(item => item.url.startsWith(seo.SITE_URL + "/") && !/fabrica|checkout|dashboard|exclusivo|[?#]/.test(item.url)));
});

test("structured data cannot close its script element", () => {
  const payload = { name: '</script><script>alert(1)</script>' };
  assert(!seo.jsonLd(payload).includes("<"));
  assert.deepEqual(JSON.parse(seo.jsonLd(payload)), payload);
});

test("image optimization accepts configured hosts and rejects lookalike hosts", () => {
  const { canOptimizeImage } = load("src/lib/image-source.ts");
  assert(canOptimizeImage("https://project.supabase.co/storage/v1/object/public/image.jpg"));
  assert(canOptimizeImage("/uploads/photo.jpg"));
  assert(!canOptimizeImage("https://project.supabase.co.attacker.test/photo.jpg"));
  assert(!canOptimizeImage("//attacker.test/photo.jpg"));
});
