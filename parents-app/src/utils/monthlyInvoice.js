const escape = value => String(value ?? '--').replace(/[&<>"']/g, character => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[character]));

export function monthlyInvoiceDocument(invoice) {
  const rows = [
    ['Invoice', invoice.invoiceNumber || invoice._id], ['Student', invoice.childId?.name || invoice.childName],
    ['Institute', invoice.instituteName || invoice.childId?.school], ['Route', invoice.routeName],
    ['Billing month', invoice.month], ['Status', invoice.status],
    ['Amount', `INR ${Number(invoice.totalAmount || 0).toFixed(2)}`],
    ['Payment reference', invoice.razorpayPaymentId], ['Paid on', invoice.paidAt ? new Date(invoice.paidAt).toLocaleDateString('en-IN') : '--'],
  ];
  return '<!doctype html><html lang="en"><meta charset="utf-8"><title>ASAN transport invoice</title><style>body{font:16px system-ui;max-width:760px;margin:40px auto;padding:24px;color:#222}h1{border-bottom:4px solid #ffb400;padding-bottom:20px}table{width:100%;border-collapse:collapse}th,td{text-align:left;padding:14px;border-bottom:1px solid #ddd;overflow-wrap:anywhere}th{width:35%}</style><h1>ASAN Rides — Monthly transport invoice</h1><table>' + rows.map(([label,value]) => `<tr><th>${escape(label)}</th><td>${escape(value)}</td></tr>`).join('') + '</table><p>Keep this invoice for your records. Payment status is shown as recorded when downloaded.</p></html>';
}

export function downloadMonthlyInvoice(invoice) {
  const url = URL.createObjectURL(new Blob([monthlyInvoiceDocument(invoice)], {type:'text/html;charset=utf-8'}));
  const link = document.createElement('a');
  link.href = url;
  link.download = `ASAN-${String(invoice.invoiceNumber || invoice._id).replace(/[^a-zA-Z0-9-]/g,'')}.html`;
  document.body.appendChild(link); link.click(); link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
