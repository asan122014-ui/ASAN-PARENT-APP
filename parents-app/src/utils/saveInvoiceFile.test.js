import test from 'node:test';
import assert from 'node:assert/strict';
import { saveInvoiceFile } from './saveInvoiceFile.js';

test('Android sends exact binary invoice bytes to native save with the filename and type', async () => {
  const bytes = new Uint8Array([37, 80, 68, 70, 0, 128, 255]);
  let request;
  const result = await saveInvoiceFile({ blob: new Blob([bytes], { type: 'application/pdf' }), fileName: 'ASAN-123.pdf' }, {
    platform: 'android', available: true, nativeSave: async value => { request = value; return { saved: true }; },
  });
  assert.deepEqual(new Uint8Array(Buffer.from(request.data, 'base64')), bytes);
  assert.equal(request.fileName, 'ASAN-123.pdf');
  assert.equal(request.mimeType, 'application/pdf');
  assert.equal(result.saved, true);
});

test('Android handles user cancellation and unsupported old builds explicitly', async () => {
  const invoice = { blob: new Blob(['invoice'], { type: 'text/html;charset=utf-8' }), fileName: 'ASAN.html' };
  assert.deepEqual(await saveInvoiceFile(invoice, { platform: 'android', available: true, nativeSave: async () => ({ saved: false, cancelled: true }) }), { saved: false, cancelled: true });
  await assert.rejects(saveInvoiceFile(invoice, { platform: 'android', available: false }), /update the ASAN Parents app/);
  await assert.rejects(saveInvoiceFile(invoice, { platform: 'android', available: true, nativeSave: async () => { throw new Error('Disk unavailable'); } }), /Disk unavailable/);
});

test('browser download still clicks a downloadable file and releases its URL', async () => {
  const originals = { document: globalThis.document, window: globalThis.window, create: URL.createObjectURL, revoke: URL.revokeObjectURL };
  let clicked = false, removed = false, revoked = '';
  const link = { click: () => { clicked = true; }, remove: () => { removed = true; } };
  try {
    globalThis.document = { createElement: () => link, body: { appendChild: () => {} } };
    globalThis.window = { setTimeout: callback => callback() };
    URL.createObjectURL = () => 'blob:invoice'; URL.revokeObjectURL = url => { revoked = url; };
    const result = await saveInvoiceFile({ blob: new Blob(['%PDF']), fileName: 'invoice.pdf' }, { platform: 'web' });
    assert.equal(link.download, 'invoice.pdf'); assert.equal(link.href, 'blob:invoice');
    assert.ok(clicked && removed); assert.equal(revoked, 'blob:invoice'); assert.ok(result.browserDownload);
  } finally {
    globalThis.document = originals.document; globalThis.window = originals.window;
    URL.createObjectURL = originals.create; URL.revokeObjectURL = originals.revoke;
  }
});
