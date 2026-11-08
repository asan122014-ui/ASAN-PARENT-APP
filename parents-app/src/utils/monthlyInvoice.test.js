import test from 'node:test';
import assert from 'node:assert/strict';
import { monthlyInvoiceDocument } from './monthlyInvoice.js';
test('monthly download preserves unpaid status, fee and route without rendering embedded markup',()=>{
 const html=monthlyInvoiceDocument({invoiceNumber:'INV-1',childId:{name:'<script>alert(1)</script>'},month:'2026-11',status:'Pending',totalAmount:2500,routeName:'East & West'});
 assert.ok(html.includes('INR 2500.00'));assert.ok(html.includes('Pending'));
 assert.ok(html.includes('East &amp; West'));assert.ok(!html.includes('<script>'));
});
