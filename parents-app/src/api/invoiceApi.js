import {
  API,
} from "./api.js";

/* =========================================================
   GET PARENT INVOICES
========================================================= */

export const getParentInvoices =
  async (
    parentId
  ) => {
    const response =
      await API.get(
        `/invoices/parent/${parentId}`
      );

    return response.data;
  };

/* =========================================================
   GET SINGLE INVOICE
========================================================= */

export const getInvoiceById =
  async (
    invoiceId
  ) => {
    const response =
      await API.get(
        `/invoices/${invoiceId}`
      );

    return response.data;
  };