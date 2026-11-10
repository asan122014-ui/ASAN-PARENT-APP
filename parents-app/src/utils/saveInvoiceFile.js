import { Capacitor, registerPlugin } from '@capacitor/core';
const invoiceFiles = registerPlugin('InvoiceFiles');

export async function saveInvoiceFile({ blob, fileName }, options = {}) {
  const platform = options.platform ?? Capacitor.getPlatform();
  if (platform === 'android') {
    const available = options.available ?? Capacitor.isPluginAvailable('InvoiceFiles');
    if (!available) throw new Error('Please update the ASAN Parents app to save invoices on your phone.');
    const bytes = new Uint8Array(await blob.arrayBuffer());
    let binary = '';
    for (let offset = 0; offset < bytes.length; offset += 32768) binary += String.fromCharCode(...bytes.subarray(offset, offset + 32768));
    return (options.nativeSave || (data => invoiceFiles.save(data)))({
      data: btoa(binary), fileName, mimeType: blob.type.split(';')[0],
    });
  }
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url; link.download = fileName;
  document.body.appendChild(link); link.click(); link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 30000);
  return { saved: true, browserDownload: true };
}
