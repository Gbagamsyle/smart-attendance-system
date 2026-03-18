import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../../services/supabase";

export default function SessionDetails() {
  const { sessionId } = useParams();
  const [records, setRecords] = useState([]);
  const [sessionLecturerIP, setSessionLecturerIP] = useState("");
  const [loading, setLoading] = useState(true);

  const exportRows = () => {
    return records.map((record) => ({
      name: record.profiles?.name || "Unknown Student",
      matric_no: record.profiles?.matric_no || "N/A",
    }));
  };

  const downloadCSV = () => {
    const rows = exportRows();
    const csvContent = ["Name,Matric Number", ...rows.map((r) => `${JSON.stringify(r.name)},${JSON.stringify(r.matric_no)}`)].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `session-${sessionId}-attendance.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadExcel = () => {
    const rows = exportRows();
    const csvContent = ["Name\tMatric Number", ...rows.map((r) => `${r.name}\t${r.matric_no}`)].join("\n");
    const blob = new Blob([csvContent], { type: "application/vnd.ms-excel;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `session-${sessionId}-attendance.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const ensureJsPDF = () => {
    return new Promise((resolve, reject) => {
      if (window.jspdf && window.jspdf.jsPDF) {
        resolve(window.jspdf.jsPDF);
        return;
      }

      const existing = document.querySelector("script[data-lib='jspdf']");
      if (existing) {
        existing.addEventListener("load", () => {
          if (window.jspdf && window.jspdf.jsPDF) resolve(window.jspdf.jsPDF);
          else reject(new Error("jsPDF failed to load"));
        });
        existing.addEventListener("error", () => reject(new Error("jsPDF load failed")));
        return;
      }

      const script = document.createElement("script");
      script.dataset.lib = "jspdf";
      script.src = "https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js";
      script.onload = () => {
        if (window.jspdf && window.jspdf.jsPDF) resolve(window.jspdf.jsPDF);
        else reject(new Error("jsPDF not available after load"));
      };

      script.onerror = () => reject(new Error("Unable to load jsPDF."));
      document.body.appendChild(script);
    });
  };

  const downloadPDF = async () => {
    const rows = exportRows();

    let jsPDFClass;
    try {
      jsPDFClass = await ensureJsPDF();
    } catch (error) {
      console.warn("jsPDF load failed", error);
      alert("Unable to generate PDF: jsPDF load failed. Use CSV or Excel export instead.");
      return;
    }

    const doc = new jsPDFClass();
    doc.setFontSize(18);
    doc.text("Session Attendance", 14, 20);
    doc.setFontSize(11);
    doc.text(`Session: ${sessionId}`, 14, 30);

    doc.setFontSize(10);
    let y = 40;
    doc.text("Name", 14, y);
    doc.text("Matric Number", 120, y);
    y += 8;

    rows.forEach((row) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.text(row.name, 14, y);
      doc.text(row.matric_no, 120, y);
      y += 8;
    });

    doc.save(`session-${sessionId}-attendance.pdf`);
  };

  useEffect(() => {
    fetchRecords();

    const channel = supabase
      .channel("attendance-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "attendance_records",
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          console.log("New attendance:", payload);
          setRecords((prev) => [payload.new, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

  const fetchRecords = async () => {
    setLoading(true);

    const { data: sessionData, error: sessionError } = await supabase
      .from("attendance_sessions")
      .select("lecturer_ip")
      .eq("id", sessionId)
      .single();

    if (!sessionError && sessionData) {
      setSessionLecturerIP(sessionData.lecturer_ip || "");
    }

    const { data } = await supabase
      .from("attendance_records")
      .select(`
        *,
        profiles(name, matric_no)
      `)
      .eq("session_id", sessionId)
      .order("created_at", { ascending: false });

    setRecords(data || []);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Link
            to="/attendance-records"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to Sessions
          </Link>
          <h2 className="text-2xl font-bold text-gray-900">Session Attendance</h2>
        </div>

        <div className="flex flex-col md:flex-row gap-2 mb-6">
          <button
            onClick={downloadCSV}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Export CSV
          </button>
          <button
            onClick={downloadExcel}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            Export Excel
          </button>
          <button
            onClick={downloadPDF}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            Export PDF
          </button>
        </div>

        {loading ? (
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto mb-4" />
            <p className="text-gray-600">Loading session attendance...</p>
          </div>
        ) : records.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <p className="text-gray-600 text-lg">No students have checked in yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {records.map((record) => {
              const studentName = record.profiles?.name || "Unknown Student";
              const matricNo = record.profiles?.matric_no || "N/A";
              const isSuspicious =
                record.ip_address &&
                sessionLecturerIP &&
                record.ip_address !== sessionLecturerIP;

              return (
                <div
                  key={record.id}
                  className="bg-white p-4 rounded-lg border border-gray-200"
                >
                  <p className="font-semibold text-gray-900">Name: {studentName}</p>
                  <p className="text-sm text-gray-600">Matric Number: {matricNo}</p>

                  <p className="text-xs text-gray-500">
                    IP: {record.ip_address || "N/A"}
                  </p>

                  <p className="text-xs text-gray-500">
                    Device: {record.device_info?.slice(0, 40) || "N/A"}...
                  </p>

                  {isSuspicious && (
                    <span className="text-red-500 text-xs ml-2">
                      ⚠ Different Network
                    </span>
                  )}

                  <p className="text-xs text-gray-500">
                    {new Date(record.created_at).toLocaleString()}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
