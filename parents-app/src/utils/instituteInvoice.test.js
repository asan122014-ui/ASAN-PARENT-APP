import test from 'node:test';
import assert from 'node:assert/strict';
import {findStudentInvoice,currentInstituteMonth} from './instituteInvoice.js';
test('direct payment selects only the current institute invoice for the chosen child',()=>{
 const now=new Date('2026-11-09T06:00:00Z');
 const correct={_id:'invoice-a',childId:{_id:'a'},billingSource:'institute_fixed',month:'2026-11',status:'Pending'};
 assert.equal(findStudentInvoice([{...correct,childId:'b'},{...correct,month:'2026-10'},{...correct,status:'Cancelled'},correct],'a',now)?._id,'invoice-a');
 assert.equal(findStudentInvoice([{...correct,billingSource:'distance'}],'a',now),undefined);
 assert.equal(findStudentInvoice([{...correct,childId:'a',status:'Paid'}],'a',now)?.status,'Paid');
});
test('invoice month changes at midnight India time',()=>{
 assert.equal(currentInstituteMonth(new Date('2026-11-30T18:29:59Z')),'2026-11');
 assert.equal(currentInstituteMonth(new Date('2026-11-30T18:30:00Z')),'2026-12');
});
