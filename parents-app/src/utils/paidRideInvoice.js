const clean = (value) => String(value ?? "--")
  .normalize("NFKD")
  .replace(/[\u0300-\u036f]/g, "")
  .replace(/[^\x20-\x7E]/g, " ")
  .replace(/\s+/g, " ")
  .trim() || "--";

const escapePdf = (value) => clean(value).replace(/([\\()])/g, "\\$1");

const money = (value) => `INR ${Number(value || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function createPaidRideInvoicePdf(booking, parent = {}) {
  const payment = booking?.paymentId || {};
  const child = booking?.children?.length ? booking.children.map((item) => item.name).filter(Boolean).join(", ") : booking?.child?.name || booking?.childId?.name || "School ride";
  const date = payment.paidAt || booking?.paidAt;
  const paidDate = date ? new Date(date).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" }) : "--";
  const invoiceNumber = `ASAN-${String(payment.paymentId || booking?._id || "RIDE").replace(/[^a-zA-Z0-9]/g, "").slice(-14).toUpperCase()}`;
  const rows = [
    ["Invoice number", invoiceNumber],
    ["Payment status", "PAID - VERIFIED BY RAZORPAY"],
    ["Payment date", paidDate],
    ["Payment reference", payment.paymentId || "Not provided"],
    ["Parent", parent.name || parent.fullName || "Parent account"],
    ["Parent email", parent.email || "Not provided"],
    ["Child", child],
    ["School", booking?.child?.school || booking?.children?.[0]?.school || booking?.childId?.school || "--"],
    ["Driver ASAN ID", booking?.assignedDriverId || "--"],
    ["Pickup", booking?.route?.pickup || "--"],
    ["School destination", booking?.route?.dropoff || "--"],
    ["Route distance", `${Number(booking?.route?.distanceKm || 0).toFixed(2)} km one way`],
    ["Vehicle", booking?.quote?.vehicleType || "--"],
    ["Service period", `${date ? new Date(date).toLocaleDateString("en-IN", { month: "short", year: "numeric" }) : "--"} - ${booking?.serviceEndsAt ? new Date(booking.serviceEndsAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" }) : "One month"}`],
  ];

  const commands = [];
  const text = (value, x, y, size = 11, bold = false, color = "0.12 0.12 0.12") => {
    commands.push(`BT ${color} rg /${bold ? "F2" : "F1"} ${size} Tf 1 0 0 1 ${x} ${y} Tm (${escapePdf(value)}) Tj ET`);
  };
  const line = (x1, y1, x2, y2, color = "0.91 0.70 0.08", width = 1) => commands.push(`${color} RG ${width} w ${x1} ${y1} m ${x2} ${y2} l S`);

  commands.push("0.99 0.98 0.94 rg 0 0 595 842 re f");
  commands.push("1 0.71 0 rg 0 822 595 20 re f");
  text("ASAN RIDES", 46, 775, 24, true);
  text("MONTHLY SCHOOL TRANSPORT", 46, 754, 9, true, "0.55 0.38 0.02");
  text("PAYMENT INVOICE", 46, 708, 19, true);
  text("This document confirms the monthly ride payment listed below.", 46, 688, 10, false, "0.35 0.35 0.35");
  line(46, 669, 549, 669, "0.91 0.70 0.08", 1.5);

  let y = 640;
  for (const [label, rawValue] of rows) {
    const value = clean(rawValue);
    const maxChars = 49;
    const parts = value.match(new RegExp(`.{1,${maxChars}}`, "g")) || ["--"];
    text(label, 48, y, 9, false, "0.42 0.42 0.42");
    text(parts[0], 230, y, 10, true);
    y -= 16;
    for (const part of parts.slice(1)) {
      text(part, 230, y, 9, false);
      y -= 13;
    }
    line(48, y + 6, 547, y + 6, "0.91 0.88 0.79", 0.45);
    y -= 7;
  }

  commands.push("1 0.95 0.77 rg 46 105 503 62 re f");
  text("AMOUNT PAID", 62, 145, 9, true, "0.49 0.34 0.02");
  text(money(payment.amount ?? booking?.quote?.totalMonthly), 62, 119, 21, true);
  text("Payment verified with Razorpay. Keep this invoice for your records.", 46, 77, 9, false, "0.38 0.38 0.38");
  text("ASAN RIDES  |  Every ride, with care.", 46, 56, 8, true, "0.55 0.38 0.02");

  const content = commands.join("\n");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> /Contents 4 0 R >>",
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>",
  ];

  let pdf = "%PDF-1.4\n%ASAN\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const offset of offsets.slice(1)) pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return { blob: new Blob([pdf], { type: "application/pdf" }), fileName: `${invoiceNumber}.pdf` };
}

export function downloadPaidRideInvoice(booking, parent) {
  const { blob, fileName } = createPaidRideInvoicePdf(booking, parent);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
