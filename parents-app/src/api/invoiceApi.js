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

export const createInvoicePaymentOrder = async (invoiceId) => {
  const response = await API.post(`/invoices/${invoiceId}/payment/order`);
  return response.data?.data;
};

export const verifyInvoicePayment = async (invoiceId, paymentResult) => {
  const response = await API.post(`/invoices/${invoiceId}/payment/verify`, paymentResult);
  return response.data?.data;
};
