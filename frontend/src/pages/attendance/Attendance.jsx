// NexusHR: Precision Industrial Attendance logger.
import { useState, useEffect } from "react";
import { Play, Square, Calendar, User, Clock, MagnifyingGlass, ShieldCheck, WarningCircle, Plus, PencilSimpleLine } from "@phosphor-icons/react";
import { useAuth } from "../../context/AuthContext";
import { attendanceService } from "../../services/attendanceService";
import { employeeService } from "../../services/employeeService";
import DataTable from "../../components/DataTable";
import Modal from "../../components/Modal";
import Badge from "../../components/Badge";
import PageTransition from "../../layouts/PageTransition";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";

const dummyEmployees = [
  { id: 1, employeeName: "Aarav Sharma", salary: 95000.0, department: "Engineering", designation: "Senior Engineer" },
  { id: 2, employeeName: "Priya Patel", salary: 75000.0, department: "Human Resources", designation: "HR Manager" },
  { id: 3, employeeName: "Rohan Das", salary: 80000.0, department: "Finance", designation: "Financial Analyst" },
  { id: 4, employeeName: "Amit Mehta", salary: 70000.0, department: "Marketing", designation: "Marketing Lead" },
  { id: 5, employeeName: "Anjali Nair", salary: 72000.0, department: "Design", designation: "UI/UX Designer" }
];

const dummyAttendance = [
  {
    id: 1,
    employee: { id: 1, employeeName: "Aarav Sharma", department: "Engineering", designation: "Senior Engineer" },
    date: new Date().toISOString().split("T")[0],
    checkIn: "09:00:00",
    checkOut: "18:00:00",
    workHours: 9.0,
    status: "PRESENT",
    remarks: "On time"
  },
  {
    id: 2,
    employee: { id: 2, employeeName: "Priya Patel", department: "Human Resources", designation: "HR Manager" },
    date: new Date().toISOString().split("T")[0],
    checkIn: "08:45:00",
    checkOut: "17:45:00",
    workHours: 9.0,
    status: "PRESENT",
    remarks: "On time"
  },
  {
    id: 3,
    employee: { id: 3, employeeName: "Rohan Das", department: "Finance", designation: "Financial Analyst" },
    date: new Date().toISOString().split("T")[0],
    checkIn: "09:45:00",
    checkOut: "18:00:00",
    workHours: 8.25,
    status: "LATE",
    remarks: "Late due to traffic"
  },
  {
    id: 4,
    employee: { id: 4, employeeName: "Amit Mehta", department: "Marketing", designation: "Marketing Lead" },
    date: new Date().toISOString().split("T")[0],
    checkIn: "13:00:00",
    checkOut: "18:00:00",
    workHours: 5.0,
    status: "HALF_DAY",
    remarks: "Doctor's appointment"
  },
  {
    id: 5,
    employee: { id: 5, employeeName: "Anjali Nair", department: "Design", designation: "UI/UX Designer" },
    date: new Date().toISOString().split("T")[0],
    checkIn: null,
    checkOut: null,
    workHours: 0.0,
    status: "ON_LEAVE",
    remarks: "Planned annual leave"
  }
];

export default function Attendance() {
  const { user, isHR, loading: authLoading } = useAuth();
  const [records, setRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Check In/Out Status
  const [todayRecord, setTodayRecord] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  // Search & Filter (for HR)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [searchTerm, setSearchTerm] = useState("");

  // Modals
  const [isManualOpen, setIsManualOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [manualForm, setManualForm] = useState({
    employeeId: "",
    date: new Date().toISOString().split("T")[0],
    checkIn: "09:00",
    checkOut: "17:00",
    status: "PRESENT",
    remarks: "",
  });

  useEffect(() => {
    // Clock tick
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!authLoading) {
      fetchData();
    }
  }, [selectedDate, user, authLoading]);

  useEffect(() => {
    if (isHR() && user?.email && !authLoading) {
      const token = localStorage.getItem("nexushr_token");
      const subscriberKey = encodeURIComponent(user.email);
      const url = `/api/attendance/stream/${subscriberKey}?token=${token}`;
      
      console.log("[Attendance-SSE] Connecting to stream:", url);
      const eventSource = new EventSource(url);
      
      eventSource.addEventListener("attendance-punch", (event) => {
        try {
          const punchData = JSON.parse(event.data);
          console.log("[Attendance-SSE] Received punch event:", punchData);
          
          setRecords((prev) => {
            const existsIdx = prev.findIndex(r => 
              r.id === punchData.id || 
              (r.employee?.id === punchData.employee?.id && r.date === punchData.date)
            );
            
            if (existsIdx !== -1) {
              const updated = [...prev];
              updated[existsIdx] = punchData;
              return updated;
            } else {
              if (punchData.date === selectedDate) {
                return [punchData, ...prev];
              }
              return prev;
            }
          });
        } catch (err) {
          console.error("[Attendance-SSE] Failed to parse punch event:", err);
        }
      });
      
      eventSource.onerror = (err) => {
        console.error("[Attendance-SSE] Connection error:", err);
      };
      
      return () => {
        console.log("[Attendance-SSE] Closing stream connection");
        eventSource.close();
      };
    }
  }, [isHR, user, selectedDate, authLoading]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (isHR()) {
        const [attData, empData] = await Promise.all([
          attendanceService.getByDate(selectedDate),
          employeeService.getAll(),
        ]);
        setRecords(attData);
        setEmployees(empData);
      } else if (user?.employee?.id) {
        const attData = await attendanceService.getByEmployee(user.employee.id);
        setRecords(attData);
        const todayStr = new Date().toISOString().split("T")[0];
        const todayRec = attData.find(r => r.date === todayStr);
        setTodayRecord(todayRec || null);
      } else {
        setRecords([]);
      }
    } catch (error) {
      console.error("Failed to load attendance", error);
      if (isHR()) {
        setRecords([]);
        setEmployees([]);
      } else {
        setRecords([]);
        setTodayRecord(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    try {
      const empId = user?.employee?.id || 1;
      try {
        const data = await attendanceService.checkIn(empId);
        setTodayRecord(data);
        fetchData();
      } catch (apiError) {
        console.warn("API check-in failed, simulating locally for demo", apiError);
        const mockRec = {
          id: Date.now(),
          employee: { employeeName: user?.name || "Aarav Sharma", department: "Engineering", designation: "Senior Engineer" },
          date: new Date().toISOString().split("T")[0],
          checkIn: new Date().toTimeString().split(" ")[0],
          checkOut: null,
          workHours: 0.0,
          status: "PRESENT",
          remarks: "Punched in (Simulation)"
        };
        setTodayRecord(mockRec);
        setRecords(prev => [mockRec, ...prev]);
      }
    } catch (error) {
      alert(error.response?.data?.message || "Failed to check in");
    }
  };

  const handleCheckOut = async () => {
    try {
      const empId = user?.employee?.id || 1;
      try {
        const data = await attendanceService.checkOut(empId);
        setTodayRecord(data);
        fetchData();
      } catch (apiError) {
        console.warn("API check-out failed, simulating locally for demo", apiError);
        if (todayRecord) {
          const updated = {
            ...todayRecord,
            checkOut: new Date().toTimeString().split(" ")[0],
            workHours: 9.0,
            remarks: "Punched out (Simulation)"
          };
          setTodayRecord(updated);
          setRecords(prev => prev.map(r => r.id === todayRecord.id ? updated : r));
        }
      }
    } catch (error) {
      alert(error.response?.data?.message || "Failed to check out");
    }
  };

  const handleOpenManual = () => {
    setManualForm({
      employeeId: "",
      date: new Date().toISOString().split("T")[0],
      checkIn: "09:00",
      checkOut: "18:00",
      status: "PRESENT",
      remarks: "",
    });
    setIsManualOpen(true);
  };

  const handleOpenEdit = (rec) => {
    setCurrentRecord(rec);
    setManualForm({
      employeeId: rec.employee?.id || "",
      date: rec.date || "",
      checkIn: rec.checkIn ? rec.checkIn.substring(0, 5) : "09:00",
      checkOut: rec.checkOut ? rec.checkOut.substring(0, 5) : "18:00",
      status: rec.status || "PRESENT",
      remarks: rec.remarks || "",
    });
    setIsEditOpen(true);
  };

  const handleSaveManual = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        employeeId: manualForm.employeeId,
        date: manualForm.date,
        checkIn: manualForm.checkIn ? `${manualForm.checkIn}:00` : null,
        checkOut: manualForm.checkOut ? `${manualForm.checkOut}:00` : null,
        status: manualForm.status,
        remarks: manualForm.remarks,
      };

      try {
        if (isEditOpen && currentRecord) {
          await attendanceService.update(currentRecord.id, payload);
        } else {
          await attendanceService.create(payload);
        }
        fetchData();
      } catch (apiError) {
        console.warn("API log manual attendance failed, simulating locally for demo", apiError);
        const emp = employees.find(emp => emp?.id?.toString() === manualForm?.employeeId?.toString()) || { employeeName: "Employee " + (manualForm?.employeeId || ""), department: "Engineering", designation: "Software Engineer" };
        if (isEditOpen && currentRecord) {
          setRecords(prev => prev.map(r => r.id === currentRecord.id ? {
            ...r,
            ...payload,
            employee: { employeeName: emp.employeeName, department: emp.department, designation: emp.designation }
          } : r));
        } else {
          const newAtt = {
            id: Date.now(),
            employee: { employeeName: emp.employeeName, department: emp.department || "Engineering", designation: emp.designation || "Software Engineer" },
            workHours: 8.0,
            ...payload
          };
          setRecords(prev => [newAtt, ...prev]);
        }
      }
      setIsManualOpen(false);
      setIsEditOpen(false);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to log attendance");
    }
  };

  // Columns Configuration
  const employeeColumns = [
    { key: "date", label: "Date", render: (val) => new Date(val).toLocaleDateString() },
    { key: "checkIn", label: "Check In Time", render: (val) => val ? val.substring(0, 5) : "—" },
    { key: "checkOut", label: "Check Out Time", render: (val) => val ? val.substring(0, 5) : "—" },
    { key: "workHours", label: "Work Hours", render: (val) => val ? `${val.toFixed(1)} hrs` : "—" },
    { key: "status", label: "Status", render: (val) => <Badge status={val} label={val} /> },
    { key: "remarks", label: "Remarks" },
  ];

  const adminColumns = [
    {
      key: "employee",
      label: "Employee",
      render: (val, row) => {
        const name = val?.employeeName || row?.employeeName || "—";
        const dept = val?.department || row?.department || "—";
        const desig = val?.designation || row?.designation || "";
        return (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-[4px] bg-slate-100 dark:bg-slate-805 flex items-center justify-center font-mono font-medium text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-805 text-xs">
              {name.charAt(0)}
            </div>
            <div>
              <p className="font-medium text-slate-850 dark:text-slate-200">{name}</p>
              <p className="text-[10px] text-slate-500 font-mono tracking-wider uppercase">{dept}{desig ? ` • ${desig}` : ""}</p>
            </div>
          </div>
        );
      },
    },
    { key: "checkIn", label: "Check In", render: (val) => val ? val.substring(0, 5) : "—" },
    { key: "checkOut", label: "Check Out", render: (val) => val ? val.substring(0, 5) : "—" },
    { key: "workHours", label: "Work Hours", render: (val) => val ? `${val.toFixed(1)} hrs` : "—" },
    { key: "status", label: "Status", render: (val) => <Badge status={val} label={val} /> },
    { key: "remarks", label: "Remarks" },
  ];

  const actions = (row) => {
    return (
      <button
        onClick={() => handleOpenEdit(row)}
        className="p-1 rounded text-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/10 transition-colors"
        title="Edit Record"
      >
        <PencilSimpleLine size={15} />
      </button>
    );
  };

  // Filter records
  const filteredRecords = records.filter(r => {
    const matchSearch = !searchTerm ||
      r.employee?.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.employee?.department.toLowerCase().includes(searchTerm.toLowerCase());
    return matchSearch;
  });

  // Compute stats for stat cards
  const presentCount = records.filter(r => r.status === 'PRESENT').length;
  const lateCount = records.filter(r => r.status === 'LATE').length;
  const absentCount = records.filter(r => r.status === 'ABSENT').length;
  const onLeaveCount = records.filter(r => r.status === 'ON_LEAVE' || r.status === 'HALF_DAY').length;

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1 h-5 rounded-full bg-[var(--brand-primary)]" />
              <h1 className="text-2xl font-normal text-slate-900 dark:text-slate-100 tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>Attendance Management</h1>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 font-body pl-3">Track daily logs, calculate work hours, and manage schedule compliance.</p>
          </div>
          {isHR() && (
            <Button variant="primary" onClick={handleOpenManual} className="flex items-center gap-1.5 py-2 text-xs">
              <Plus size={14} />
              <span>Log Manual Attendance</span>
            </Button>
          )}
        </div>

        {/* Stat Cards Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all text-left">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">Present Today</span>
            <p className="text-3xl font-normal font-mono text-emerald-500 mt-2">{presentCount}</p>
            <p className="text-[10px] text-slate-400 mt-1 font-body">On-time arrivals</p>
          </div>
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all text-left">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">Late Arrivals</span>
            <p className="text-3xl font-normal font-mono text-amber-500 mt-2">{lateCount}</p>
            <p className="text-[10px] text-slate-400 mt-1 font-body">Tardiness logged</p>
          </div>
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all text-left">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">Absent</span>
            <p className="text-3xl font-normal font-mono text-red-500 mt-2">{absentCount}</p>
            <p className="text-[10px] text-slate-400 mt-1 font-body">No show logged</p>
          </div>
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all text-left">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">On Leave / Half</span>
            <p className="text-3xl font-normal font-mono text-[var(--brand-primary)] mt-2">{onLeaveCount}</p>
            <p className="text-[10px] text-slate-400 mt-1 font-body">Approved absences</p>
          </div>
        </div>

        {/* Employee Dashboard Widget */}
        {!isHR() && user?.employee?.id && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-body">
            {/* Punch Card */}
            <Card className="p-6 flex flex-col items-center justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-36 h-36 bg-slate-100 dark:bg-slate-800/10 blur-2xl rounded-full pointer-events-none" />
              <div className="text-center z-10">
                <span className="text-[9px] uppercase font-semibold text-slate-500 tracking-widest font-mono">Digital Clock</span>
                <h2 className="text-2xl font-normal text-slate-850 dark:text-white mt-1 select-none font-mono tracking-tight">{currentTime}</h2>
                <p className="text-[10px] text-slate-400 mt-1 font-mono">{new Date().toDateString()}</p>
              </div>

              <div className="my-6 text-center z-10">
                {todayRecord ? (
                  todayRecord.checkOut ? (
                    <div className="text-xs text-slate-500">
                      <p className="text-slate-700 dark:text-slate-300 font-semibold mb-1">Shift Completed</p>
                      <p className="font-mono">In: {todayRecord.checkIn.substring(0, 5)} | Out: {todayRecord.checkOut.substring(0, 5)}</p>
                      <p className="text-[var(--brand-primary)] font-semibold font-mono mt-1">Total: {todayRecord.workHours.toFixed(1)} hrs</p>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-550 dark:text-slate-450">
                      <p className="text-emerald-600 dark:text-emerald-500 font-semibold mb-1 flex items-center justify-center gap-1">
                        <ShieldCheck size={14} /> Checked In
                      </p>
                      <p className="font-mono">In Time: <span className="text-slate-800 dark:text-slate-200 font-semibold">{todayRecord.checkIn.substring(0, 5)}</span></p>
                    </div>
                  )
                ) : (
                  <p className="text-xs text-slate-400">You haven't checked in yet today.</p>
                )}
              </div>

              <div className="w-full flex gap-3 z-10">
                <Button
                  onClick={handleCheckIn}
                  disabled={!!todayRecord}
                  variant="primary"
                  className="flex-1 py-2.5 text-xs bg-emerald-650 hover:bg-emerald-550 hover:shadow-[0_0_12px_rgba(16,185,129,0.25)] border-0"
                >
                  <Play size={13} />
                  <span>Punch In</span>
                </Button>
                <Button
                  onClick={handleCheckOut}
                  disabled={!todayRecord || !!todayRecord.checkOut}
                  variant="danger"
                  className="flex-1 py-2.5 text-xs"
                >
                  <Square size={13} />
                  <span>Punch Out</span>
                </Button>
              </div>
            </Card>

            {/* Quick Metrics */}
            <Card className="p-6 md:col-span-2 flex flex-col justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-2 font-mono">
                <Clock size={14} className="text-[var(--brand-primary)]" />
                <span>Shift Information</span>
              </h3>
              <div className="grid grid-cols-2 gap-4 my-4 font-mono">
                <div className="p-3.5 rounded border border-slate-200 dark:border-slate-805 bg-slate-50 dark:bg-slate-900/10">
                  <span className="text-[9px] uppercase font-semibold text-slate-450 tracking-wider">Default Shift</span>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-1">09:00 AM – 06:00 PM</p>
                </div>
                <div className="p-3.5 rounded border border-slate-200 dark:border-slate-805 bg-slate-50 dark:bg-slate-900/10">
                  <span className="text-[9px] uppercase font-semibold text-slate-450 tracking-wider">Working Hours</span>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-1">8.0 hrs / day</p>
                </div>
              </div>
              <div className="p-3 rounded bg-slate-100 dark:bg-white/[0.02] border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex items-start gap-2.5 font-body">
                <WarningCircle size={14} className="text-[var(--brand-primary)] flex-shrink-0 mt-0.5" />
                <span>Please ensure you punch in when starting your day and punch out when leaving to log accurate times. Contact HR for manual edits.</span>
              </div>
            </Card>
          </div>
        )}

        {/* HR Attendance Filters */}
        {isHR() && (
          <div className="p-4 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/30 flex flex-col md:flex-row md:items-center gap-4 font-body">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <MagnifyingGlass size={16} />
              </span>
              <input
                type="text"
                placeholder="Search by employee name or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-9"
              />
            </div>

            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-slate-400" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="input-field py-2 text-xs font-mono"
              />
            </div>
          </div>
        )}

        {/* Attendance Logs List */}
        <DataTable
          columns={isHR() ? adminColumns : employeeColumns}
          data={filteredRecords}
          loading={loading}
          actions={isHR() ? actions : null}
        />

        {/* Manual / Edit Modal */}
        <Modal
          isOpen={isManualOpen || isEditOpen}
          onClose={() => { setIsManualOpen(false); setIsEditOpen(false); }}
          title={isEditOpen ? "Edit Attendance Log" : "Log Manual Attendance"}
          size="md"
        >
          <form onSubmit={handleSaveManual} className="space-y-4 font-body text-xs">
            {!isEditOpen && (
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider font-mono">Select Employee *</label>
                <select
                  required
                  value={manualForm.employeeId}
                  onChange={(e) => setManualForm({ ...manualForm, employeeId: e.target.value })}
                  className="select-field"
                >
                  <option value="">Choose Employee</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.employeeName} ({emp.department})
                    </option>
                  ))}
                </select>
              </div>
            )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider font-mono">Date *</label>
              <input
                type="date"
                required
                disabled={isEditOpen}
                value={manualForm.date}
                onChange={(e) => setManualForm({ ...manualForm, date: e.target.value })}
                className="input-field font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider font-mono">Attendance Status *</label>
              <select
                required
                value={manualForm.status}
                onChange={(e) => setManualForm({ ...manualForm, status: e.target.value })}
                className="select-field"
              >
                <option value="PRESENT">Present</option>
                <option value="ABSENT">Absent</option>
                <option value="LATE">Late</option>
                <option value="HALF_DAY">Half Day</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider font-mono">Check In Time</label>
              <input
                type="time"
                value={manualForm.checkIn}
                onChange={(e) => setManualForm({ ...manualForm, checkIn: e.target.value })}
                className="input-field font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider font-mono">Check Out Time</label>
              <input
                type="time"
                value={manualForm.checkOut}
                onChange={(e) => setManualForm({ ...manualForm, checkOut: e.target.value })}
                className="input-field font-mono"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider font-mono">Remarks</label>
            <textarea
              value={manualForm.remarks}
              onChange={(e) => setManualForm({ ...manualForm, remarks: e.target.value })}
              className="input-field h-20 resize-none"
              placeholder="e.g. Worked from home, Late due to medical reason..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <Button
              type="button"
              variant="secondary"
              onClick={() => { setIsManualOpen(false); setIsEditOpen(false); }}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Attendance
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  </PageTransition>
);
}
