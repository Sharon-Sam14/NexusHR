// NexusHR: Futuristic Smart HRMS attendance logger supporting check-in/out, biometric simulation, manual entries, and work hour calculations.
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Play, Square, Calendar, User, Clock, Search, ShieldCheck, AlertCircle, Plus, Edit2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { attendanceService } from "../../services/attendanceService";
import { employeeService } from "../../services/employeeService";
import DataTable from "../../components/DataTable";
import Modal from "../../components/Modal";
import Badge from "../../components/Badge";

const dummyEmployees = [
  { id: 1, employeeName: "Alice Johnson", salary: 95000.0, department: "Engineering", designation: "Senior Engineer" },
  { id: 2, employeeName: "Bob Smith", salary: 75000.0, department: "Human Resources", designation: "HR Manager" },
  { id: 3, employeeName: "Carol Williams", salary: 80000.0, department: "Finance", designation: "Financial Analyst" },
  { id: 4, employeeName: "David Lee", salary: 70000.0, department: "Marketing", designation: "Marketing Lead" },
  { id: 5, employeeName: "Eva Martinez", salary: 72000.0, department: "Design", designation: "UI/UX Designer" }
];

const dummyAttendance = [
  {
    id: 1,
    employee: { id: 1, employeeName: "Alice Johnson", department: "Engineering", designation: "Senior Engineer" },
    date: new Date().toISOString().split("T")[0],
    checkIn: "09:00:00",
    checkOut: "18:00:00",
    workHours: 9.0,
    status: "PRESENT",
    remarks: "On time"
  },
  {
    id: 2,
    employee: { id: 2, employeeName: "Bob Smith", department: "Human Resources", designation: "HR Manager" },
    date: new Date().toISOString().split("T")[0],
    checkIn: "08:45:00",
    checkOut: "17:45:00",
    workHours: 9.0,
    status: "PRESENT",
    remarks: "On time"
  },
  {
    id: 3,
    employee: { id: 3, employeeName: "Carol Williams", department: "Finance", designation: "Financial Analyst" },
    date: new Date().toISOString().split("T")[0],
    checkIn: "09:45:00",
    checkOut: "18:00:00",
    workHours: 8.25,
    status: "LATE",
    remarks: "Late due to traffic"
  },
  {
    id: 4,
    employee: { id: 4, employeeName: "David Lee", department: "Marketing", designation: "Marketing Lead" },
    date: new Date().toISOString().split("T")[0],
    checkIn: "13:00:00",
    checkOut: "18:00:00",
    workHours: 5.0,
    status: "HALF_DAY",
    remarks: "Doctor's appointment"
  },
  {
    id: 5,
    employee: { id: 5, employeeName: "Eva Martinez", department: "Design", designation: "UI/UX Designer" },
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

  const fetchData = async () => {
    setLoading(true);
    try {
      if (isHR()) {
        const [attData, empData] = await Promise.all([
          attendanceService.getByDate(selectedDate),
          employeeService.getAll(),
        ]);
        setRecords(attData.length > 0 ? attData : dummyAttendance);
        setEmployees(empData.length > 0 ? empData : dummyEmployees);
      } else if (user?.employee?.id) {
        const attData = await attendanceService.getByEmployee(user.employee.id);
        const activeData = attData.length > 0 ? attData : dummyAttendance.filter(r => r.employee?.employeeName === user.name);
        setRecords(activeData);
        const todayStr = new Date().toISOString().split("T")[0];
        const todayRec = activeData.find(r => r.date === todayStr);
        setTodayRecord(todayRec || null);
      } else {
        setRecords(dummyAttendance);
      }
    } catch (error) {
      console.error("Failed to load attendance", error);
      if (isHR()) {
        setRecords(dummyAttendance);
        setEmployees(dummyEmployees);
      } else {
        const myAtt = dummyAttendance.filter(r => r.employee?.employeeName === user?.name);
        setRecords(myAtt);
        const todayStr = new Date().toISOString().split("T")[0];
        const todayRec = myAtt.find(r => r.date === todayStr);
        setTodayRecord(todayRec || null);
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
          employee: { employeeName: user?.name || "Alice Johnson", department: "Engineering", designation: "Senior Engineer" },
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
            <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center font-bold text-cyan-400">
              {name.charAt(0)}
            </div>
            <div>
              <p className="font-semibold text-white">{name}</p>
              <p className="text-xs text-slate-400">{dept}{desig ? ` • ${desig}` : ""}</p>
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
        className="btn-icon text-cyan-400 hover:text-cyan-300"
        title="Edit Record"
      >
        <Edit2 size={14} />
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Attendance Management</h1>
          <p className="page-subtitle">Track daily logs, calculate work hours, and manage schedule compliance.</p>
        </div>
        {isHR() && (
          <button onClick={handleOpenManual} className="btn-primary flex items-center gap-1.5">
            <Plus size={16} />
            <span>Log Manual Attendance</span>
          </button>
        )}
      </div>

      {/* Employee Dashboard Widget */}
      {!isHR() && user?.employee?.id && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Punch Card */}
          <div className="glass-card p-6 flex flex-col items-center justify-between border border-slate-700/50 relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950/20">
            <div className="absolute top-0 right-0 w-36 h-36 bg-cyan-500/5 blur-2xl rounded-full" />
            <div className="text-center">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Digital Clock</span>
              <h2 className="text-3xl font-extrabold text-white mt-1 select-none font-mono tabular-nums">{currentTime}</h2>
              <p className="text-xs text-slate-400 mt-1">{new Date().toDateString()}</p>
            </div>

            <div className="my-6 text-center">
              {todayRecord ? (
                todayRecord.checkOut ? (
                  <div className="text-xs text-slate-400">
                    <p className="text-slate-300 font-semibold mb-1">Shift Completed</p>
                    <p>In: {todayRecord.checkIn.substring(0, 5)} | Out: {todayRecord.checkOut.substring(0, 5)}</p>
                    <p className="text-cyan-400 font-medium mt-1">Total: {todayRecord.workHours.toFixed(1)} hrs</p>
                  </div>
                ) : (
                  <div className="text-xs text-slate-400">
                    <p className="text-emerald-400 font-semibold mb-1 flex items-center justify-center gap-1">
                      <ShieldCheck size={14} /> Checked In
                    </p>
                    <p>In Time: <span className="text-white font-medium">{todayRecord.checkIn.substring(0, 5)}</span></p>
                  </div>
                )
              ) : (
                <p className="text-xs text-slate-500">You haven't checked in yet today.</p>
              )}
            </div>

            <div className="w-full flex gap-3">
              <button
                onClick={handleCheckIn}
                disabled={!!todayRecord}
                className="flex-1 btn-success flex items-center justify-center gap-1.5 py-3 text-xs"
              >
                <Play size={14} />
                <span>Punch In</span>
              </button>
              <button
                onClick={handleCheckOut}
                disabled={!todayRecord || !!todayRecord.checkOut}
                className="flex-1 btn-danger flex items-center justify-center gap-1.5 py-3 text-xs"
              >
                <Square size={14} />
                <span>Punch Out</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="glass-card p-6 md:col-span-2 border border-slate-700/50 flex flex-col justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Clock size={16} className="text-cyan-400" />
              <span>Shift Information</span>
            </h3>
            <div className="grid grid-cols-2 gap-4 my-4">
              <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/30">
                <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">Default Shift</span>
                <p className="text-sm font-semibold text-white mt-1">09:00 AM – 06:00 PM</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/30">
                <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">Working Hours</span>
                <p className="text-sm font-semibold text-white mt-1">8.0 hrs / day</p>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-cyan-500/5 border border-cyan-500/20 text-xs text-slate-400 flex items-start gap-2.5">
              <AlertCircle size={15} className="text-cyan-400 flex-shrink-0 mt-0.5" />
              <span>Please ensure you punch in when starting your day and punch out when leaving to log accurate times. Contact HR for manual edits.</span>
            </div>
          </div>
        </div>
      )}

      {/* HR Attendance Filters */}
      {isHR() && (
        <div className="glass-card p-4 flex flex-col md:flex-row md:items-center gap-4">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
              <Search size={18} />
            </span>
            <input
              type="text"
              placeholder="Search by employee name or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>

          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-slate-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="input-field py-2 text-xs"
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
        <form onSubmit={handleSaveManual} className="space-y-4">
          {!isEditOpen && (
            <div className="space-y-1">
              <label className="input-label">Select Employee *</label>
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
              <label className="input-label">Date *</label>
              <input
                type="date"
                required
                disabled={isEditOpen}
                value={manualForm.date}
                onChange={(e) => setManualForm({ ...manualForm, date: e.target.value })}
                className="input-field"
              />
            </div>

            <div className="space-y-1">
              <label className="input-label">Attendance Status *</label>
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
              <label className="input-label">Check In Time</label>
              <input
                type="time"
                value={manualForm.checkIn}
                onChange={(e) => setManualForm({ ...manualForm, checkIn: e.target.value })}
                className="input-field"
              />
            </div>

            <div className="space-y-1">
              <label className="input-label">Check Out Time</label>
              <input
                type="time"
                value={manualForm.checkOut}
                onChange={(e) => setManualForm({ ...manualForm, checkOut: e.target.value })}
                className="input-field"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="input-label">Remarks</label>
            <textarea
              value={manualForm.remarks}
              onChange={(e) => setManualForm({ ...manualForm, remarks: e.target.value })}
              className="input-field h-20 resize-none"
              placeholder="e.g. Worked from home, Late due to medical reason..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-700/50">
            <button
              type="button"
              onClick={() => { setIsManualOpen(false); setIsEditOpen(false); }}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Save Attendance
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
