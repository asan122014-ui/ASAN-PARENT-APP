import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  User,
  Route,
  IndianRupee,
  CheckCircle2,
  FileText,
  Download,
} from "lucide-react";

import { getInvoiceById } from "../../api/invoiceApi";
import StatusBadge from "../../components/billing/StatusBadge";

const InvoiceDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoice();
  }, [id]);

  const fetchInvoice = async () => {
    try {
      const res = await getInvoiceById(id);
      setInvoice(res.data);
    } catch (error) {
      console.error("Invoice fetch failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatMonth = (month) => {
    if (!month) return "--";

    const [year, mon] = month.split("-");

    return new Date(year, mon - 1).toLocaleString("en-IN", {
      month: "long",
      year: "numeric",
    });
  };

  const formatDate = (date) => {
    if (!date) return "--";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const Item = ({ icon: Icon, title, value }) => (
    <div className="flex items-center justify-between py-4 border-b border-gray-100">
      <div className="flex items-center gap-3">
        <div className="bg-yellow-100 p-2 rounded-xl">
          <Icon
            size={18}
            className="text-yellow-600"
          />
        </div>

        <span className="text-gray-600">
          {title}
        </span>
      </div>

      <span className="font-semibold text-gray-800 text-right">
        {value}
      </span>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-3xl shadow-lg p-8 flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>

          <p className="text-gray-600 font-medium">
            Loading Invoice...
          </p>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h2 className="text-xl font-semibold">
          Invoice not found
        </h2>
      </div>
    );
  }

  return (  
        <div className="min-h-screen bg-gray-100 pb-32">

      {/* ================= HEADER ================= */}

      <div className="bg-gradient-to-b from-yellow-400 to-yellow-300 rounded-b-[35px] px-6 py-8 shadow">

        <button
          onClick={() => navigate(-1)}
          className="bg-white w-10 h-10 rounded-full flex items-center justify-center shadow"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="mt-6 flex justify-between items-center">

          <div>
            <h1 className="text-3xl font-bold">
              Invoice Details
            </h1>

            <p className="text-gray-700 mt-1">
              {formatMonth(invoice.month)}
            </p>
          </div>

          <StatusBadge status={invoice.status} />

        </div>

      </div>

      <div className="px-5 -mt-6 space-y-5">

        {/* ================= INVOICE INFO ================= */}

        <div className="bg-white rounded-3xl shadow-md p-5">

          <div className="flex items-center gap-3">

            <div className="bg-yellow-100 p-3 rounded-2xl">
              <FileText
                size={24}
                className="text-yellow-600"
              />
            </div>

            <div>
              <h2 className="font-bold text-lg">
                Invoice Information
              </h2>

              <p className="text-sm text-gray-500">
                INV-{invoice._id?.slice(-6).toUpperCase()}
              </p>
            </div>

          </div>

          <div className="grid grid-cols-2 gap-5 mt-6">

            <div>
              <p className="text-xs text-gray-500">
                Parent
              </p>

              <p className="font-semibold mt-1">
                {invoice.parentId?.name || "--"}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">
                Child
              </p>

              <p className="font-semibold mt-1">
                {invoice.childId?.name ||
                  invoice.childName ||
                  "--"}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">
                Generated
              </p>

              <p className="font-semibold mt-1">
                {formatDate(invoice.createdAt)}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">
                Due Date
              </p>

              <p className="font-semibold mt-1">
                {formatDate(invoice.dueDate)}
              </p>
            </div>

          </div>

        </div>

        {/* ================= BILLING BREAKDOWN ================= */}

        <div className="bg-white rounded-3xl shadow-md p-6">

          <h2 className="text-lg font-bold mb-5">
            Billing Breakdown
          </h2>

          <Item
            icon={User}
            title="Child"
            value={
              invoice.childId?.name ||
              invoice.childName ||
              "--"
            }
          />

          <Item
            icon={CalendarDays}
            title="Completed Days"
            value={invoice.completedDays}
          />

          <Item
            icon={Route}
            title="Total Distance"
            value={`${invoice.totalDistance} km`}
          />

          <Item
            icon={IndianRupee}
            title="Rate per KM"
            value={`₹${invoice.ratePerKm}`}
          />

          <Item
            icon={IndianRupee}
            title="Base Amount"
            value={`₹${Number(
              invoice.baseAmount || 0
            ).toFixed(2)}`}
          />

          <Item
            icon={IndianRupee}
            title="Platform Fee"
            value={`₹${Number(
              invoice.platformCommission || 0
            ).toFixed(2)}`}
          />
                    <Item
            icon={CheckCircle2}
            title="Status"
            value={invoice.status}
          />

          {/* ================= TOTAL AMOUNT ================= */}

          <div className="mt-8 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-3xl p-6">

            <p className="text-gray-500 text-sm">
              Total Payable Amount
            </p>

            <h1 className="text-4xl font-bold text-yellow-600 mt-2">
              ₹{Number(invoice.totalAmount || 0).toFixed(2)}
            </h1>

          </div>

        </div>

      </div>

      {/* ================= BOTTOM ACTIONS ================= */}

      <div className="fixed bottom-5 left-0 right-0 px-5 max-w-[400px] mx-auto">

        <button
          onClick={() => {
            alert("PDF download will be added in the next phase.");
          }}
          className="w-full mb-3 border-2 border-yellow-400 text-yellow-600 py-4 rounded-2xl font-semibold flex justify-center items-center gap-2 hover:bg-yellow-50 transition"
        >
          <Download size={20} />
          Download Invoice
        </button>

        <button
          disabled={invoice.status === "Paid"}
          className={`w-full py-4 rounded-2xl text-white font-bold shadow-lg transition ${
            invoice.status === "Paid"
              ? "bg-green-500 cursor-not-allowed"
              : "bg-yellow-400 hover:bg-yellow-500"
          }`}
        >
          {invoice.status === "Paid"
            ? "Invoice Paid"
            : "Pay Now"}
        </button>

      </div>

    </div>
  );
};

export default InvoiceDetails;