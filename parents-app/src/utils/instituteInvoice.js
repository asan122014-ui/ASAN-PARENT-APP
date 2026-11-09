export function currentInstituteMonth(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {timeZone:'Asia/Kolkata',year:'numeric',month:'2-digit'}).formatToParts(now);
  return `${parts.find(part=>part.type==='year').value}-${parts.find(part=>part.type==='month').value}`;
}
export function findStudentInvoice(invoices, childId, now = new Date()) {
  return invoices.find(invoice => invoice.billingSource === 'institute_fixed' && String(invoice.childId?._id || invoice.childId) === String(childId) && invoice.month === currentInstituteMonth(now) && invoice.status !== 'Cancelled');
}
