// NexusHR: Precision Industrial Attendance logger with Biometric controls.
import { useState, useEffect } from "react";
import { 
  Play, Square, Calendar, User, Clock, MagnifyingGlass, 
  ShieldCheck, WarningCircle, Plus, PencilSimpleLine, Trash,
  WifiHigh, LinkBreak, CheckCircle, Prohibit, IdentificationCard,
  Notebook
} from "@phosphor-icons/react";
import { useAuth } from "../../context/AuthContext";
import { attendanceService } from "../../services/attendanceService";
import { employeeService } from "../../services/employeeService";
import DataTable from "../../components/DataTable";
import Modal from "../../components/Modal";
import Badge from "../../components/Badge";
import PageTransition from "../../layouts/PageTransition";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";

export default function Attendance() {
  const { user, isHR, loading: authLoading } = useAuth();
  const [records, setRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Biometric Management Lists State
  const [devices, setDevices] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [corrections, setCorrections] = useState([]);

  // Check In/Out Status
  const [todayRecord, setTodayRecord] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  // Search & Filter (for HR)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [searchTerm, setSearchTerm] = useState("");

  // Tabs state
  const [activeTab, setActiveTab] = useState("logs");

  // Modals visibility state
  const [isManualOpen, setIsManualOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeviceOpen, setIsDeviceOpen] = useState(false);
  const [isEnrollOpen, setIsEnrollOpen] = useState(false);
  const [isShiftOpen, setIsShiftOpen] = useState(false);
  const [isHolidayOpen, setIsHolidayOpen] = useState(false);
  const [isCorrectionOpen, setIsCorrectionOpen] = useState(false);

  const [currentRecord, setCurrentRecord] = useState(null);
  const [editingDevice, setEditingDevice] = useState(null);

  // Forms state
  const [manualForm, setManualForm] = useState({
    employeeId: "",
    date: new Date().toISOString().split("T")[0],
    checkIn: "09:00",
    checkOut: "17:00",
    status: "PRESENT",
    remarks: "",
  });

  const [deviceForm, setDeviceForm] = useState({
    deviceId: "",
    deviceName: "",
    ipAddress: "",
    port: 4370,
    location: "",
    serialNumber: "",
    status: "ACTIVE"
  });

  const [enrollForm, setEnrollForm] = useState({
    employeeId: "",
    biometricType: "CARD",
    cardId: "",
    biometricTemplate: ""
  });

  const [shiftForm, setShiftForm] = useState({
    shiftName: "",
    startTime: "09:00",
    endTime: "18:00",
    halfDayThresholdHours: 4.0,
    fullDayHours: 8.0,
    graceTimeMinutes: 15,
    isNightShift: false
  });

  const [holidayForm, setHolidayForm] = useState({
    holidayName: "",
    holidayDate: new Date().toISOString().split("T")[0],
    isNationalHoliday: true
  });

  const [correctionForm, setCorrectionForm] = useState({
    employeeId: "",
    attendanceDate: new Date().toISOString().split("T")[0],
    correctedCheckIn: "09:00",
    correctedCheckOut: "18:00",
    reason: ""
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
      fetchBiometricData();
    }
  }, [selectedDate, user, authLoading]);

  // SSE setup
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
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchBiometricData = async () => {
    try {
      if (isHR()) {
        const [devList, enrollList, shiftList, holList, corrList] = await Promise.all([
          attendanceService.getDevices(),
          attendanceService.getEnrollments(),
          attendanceService.getShifts(),
          attendanceService.getHolidays(),
          attendanceService.getCorrections()
        ]);
        setDevices(devList);
        setEnrollments(enrollList);
        setShifts(shiftList);
        setHolidays(holList);
        setCorrections(corrList);
      } else if (user?.employee?.id) {
        const corrList = await attendanceService.getCorrectionsByEmployee(user.employee.id);
        setCorrections(corrList);
      }
    } catch (err) {
      console.error("Failed to fetch biometric configuration logs", err);
    }
  };

  const handleCheckIn = async () => {
    try {
      const empId = user?.employee?.id || 1;
      const data = await attendanceService.checkIn(empId);
      setTodayRecord(data);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to check in");
    }
  };

  const handleCheckOut = async () => {
    try {
      const empId = user?.employee?.id || 1;
      const data = await attendanceService.checkOut(empId);
      setTodayRecord(data);
      fetchData();
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

      if (isEditOpen && currentRecord) {
        await attendanceService.update(currentRecord.id, payload);
      } else {
        await attendanceService.create(payload);
      }
      fetchData();
      setIsManualOpen(false);
      setIsEditOpen(false);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to log attendance");
    }
  };

  // Device Actions
  const handleSaveDevice = async (e) => {
    e.preventDefault();
    try {
      if (editingDevice) {
        await attendanceService.updateDevice(editingDevice.id, deviceForm);
      } else {
        await attendanceService.createDevice(deviceForm);
      }
      fetchBiometricData();
      setIsDeviceOpen(false);
      setEditingDevice(null);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save device configuration");
    }
  };

  const handleTestDeviceConnection = async (id) => {
    try {
      await attendanceService.testDeviceConnection(id);
      fetchBiometricData();
    } catch (err) {
      alert("Test connection request failed");
    }
  };

  const handleSyncDeviceLogs = async (id) => {
    try {
      await attendanceService.syncDevice(id);
      fetchBiometricData();
      fetchData();
    } catch (err) {
      alert("Manual sync logs request failed");
    }
  };

  const handleDeleteDevice = async (id) => {
    if (confirm("Are you sure you want to delete this device?")) {
      try {
        await attendanceService.deleteDevice(id);
        fetchBiometricData();
      } catch (err) {
        alert("Failed to delete device");
      }
    }
  };

  const handleOpenEnroll = () => {
    setEnrollForm({
      employeeId: "",
      biometricType: "CARD",
      cardId: "",
      biometricTemplate: ""
    });
    setIsEnrollOpen(true);
  };

  const handleSaveEnrollment = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        employee: { id: parseInt(enrollForm.employeeId) },
        biometricType: enrollForm.biometricType,
        cardId: enrollForm.cardId,
        biometricTemplate: enrollForm.biometricTemplate,
        enabled: true
      };
      await attendanceService.enrollEmployee(payload);
      fetchBiometricData();
      setIsEnrollOpen(false);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to enroll employee biometric credentials");
    }
  };

  const handleToggleEnrollment = async (id) => {
    try {
      await attendanceService.toggleEnrollment(id);
      fetchBiometricData();
    } catch (err) {
      alert("Failed to toggle activation state");
    }
  };

  const handleDeleteEnrollment = async (id) => {
    if (confirm("Are you sure you want to delete this enrollment?")) {
      try {
        await attendanceService.deleteEnrollment(id);
        fetchBiometricData();
      } catch (err) {
        alert("Failed to delete enrollment");
      }
    }
  };

  // Shift & Holidays
  const handleSaveShift = async (e) => {
    e.preventDefault();
    try {
      await attendanceService.saveShift({
        ...shiftForm,
        startTime: `${shiftForm.startTime}:00`,
        endTime: `${shiftForm.endTime}:00`
      });
      fetchBiometricData();
      setIsShiftOpen(false);
    } catch (err) {
      alert("Failed to save shift timings configuration");
    }
  };

  const handleDeleteShift = async (id) => {
    if (confirm("Delete shift configuration?")) {
      try {
        await attendanceService.deleteShift(id);
        fetchBiometricData();
      } catch (err) {
        alert("Failed to delete shift");
      }
    }
  };

  const handleSaveHoliday = async (e) => {
    e.preventDefault();
    try {
      await attendanceService.saveHoliday(holidayForm);
      fetchBiometricData();
      setIsHolidayOpen(false);
    } catch (err) {
      alert("Failed to save public holiday");
    }
  };

  const handleDeleteHoliday = async (id) => {
    if (confirm("Delete public holiday?")) {
      try {
        await attendanceService.deleteHoliday(id);
        fetchBiometricData();
      } catch (err) {
        alert("Failed to delete holiday");
      }
    }
  };

  // Corrections
  const handleOpenCorrection = () => {
    setCorrectionForm({
      employeeId: user?.employee?.id || "",
      attendanceDate: new Date().toISOString().split("T")[0],
      correctedCheckIn: "09:00",
      correctedCheckOut: "18:00",
      reason: ""
    });
    setIsCorrectionOpen(true);
  };

  const handleSaveCorrection = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        employee: { id: parseInt(correctionForm.employeeId) },
        attendanceDate: correctionForm.attendanceDate,
        correctedCheckIn: `${correctionForm.correctedCheckIn}:00`,
        correctedCheckOut: `${correctionForm.correctedCheckOut}:00`,
        reason: correctionForm.reason
      };
      await attendanceService.applyCorrection(payload);
      fetchBiometricData();
      setIsCorrectionOpen(false);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to submit correction request");
    }
  };

  const handleApproveCorrection = async (id) => {
    try {
      await attendanceService.approveCorrection(id);
      fetchBiometricData();
      fetchData();
    } catch (err) {
      alert("Failed to approve request");
    }
  };

  const handleRejectCorrection = async (id) => {
    try {
      await attendanceService.rejectCorrection(id);
      fetchBiometricData();
    } catch (err) {
      alert("Failed to reject request");
    }
  };

  // Standard Grid Columns configuration
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

  const filteredRecords = records.filter(r => {
    const matchSearch = !searchTerm ||
      r.employeeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.employee?.employeeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.employee?.department?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchSearch;
  });

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
          <div className="flex gap-2">
            {!isHR() && (
              <Button variant="secondary" onClick={handleOpenCorrection} className="flex items-center gap-1.5 py-2 text-xs">
                <Notebook size={14} />
                <span>Request Correction</span>
              </Button>
            )}
            {isHR() && activeTab === "logs" && (
              <Button variant="primary" onClick={handleOpenManual} className="flex items-center gap-1.5 py-2 text-xs">
                <Plus size={14} />
                <span>Log Manual Attendance</span>
              </Button>
            )}
            {isHR() && activeTab === "devices" && (
              <Button variant="primary" onClick={() => {
                setDeviceForm({ deviceId: "", deviceName: "", ipAddress: "", port: 4370, location: "", serialNumber: "", status: "ACTIVE" });
                setEditingDevice(null);
                setIsDeviceOpen(true);
              }} className="flex items-center gap-1.5 py-2 text-xs">
                <Plus size={14} />
                <span>Add Biometric Device</span>
              </Button>
            )}
            {isHR() && activeTab === "enrollment" && (
              <Button variant="primary" onClick={handleOpenEnroll} className="flex items-center gap-1.5 py-2 text-xs">
                <Plus size={14} />
                <span>Enroll Biometric</span>
              </Button>
            )}
            {isHR() && activeTab === "shifts" && (
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => setIsHolidayOpen(true)} className="flex items-center gap-1.5 py-2 text-xs">
                  <Plus size={14} />
                  <span>Add Public Holiday</span>
                </Button>
                <Button variant="primary" onClick={() => setIsShiftOpen(true)} className="flex items-center gap-1.5 py-2 text-xs">
                  <Plus size={14} />
                  <span>Configure Shift</span>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Stats Row */}
        {activeTab === "logs" && (
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
        )}

        {/* Employee Dashboard Punch Widget */}
        {!isHR() && user?.employee?.id && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-body">
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

        {/* HR Dashboard Tabs */}
        {isHR() && (
          <div className="flex border-b border-slate-200 dark:border-slate-800 mb-6 font-body">
            {[
              { id: "logs", label: "Attendance Logs" },
              { id: "devices", label: "Biometric Devices" },
              { id: "enrollment", label: "Biometric Enrollment" },
              { id: "shifts", label: "Shift & Holiday Settings" },
              { id: "corrections", label: "Correction Requests" }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all -mb-px ${
                  activeTab === tab.id
                    ? "border-[var(--brand-primary)] text-[var(--brand-primary)]"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* Tabs Contents */}

        {/* 1. Logs Tab */}
        {activeTab === "logs" && (
          <div className="space-y-6">
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

            <DataTable
              columns={isHR() ? adminColumns : employeeColumns}
              data={filteredRecords}
              loading={loading}
              actions={isHR() ? actions : null}
            />
          </div>
        )}

        {/* 2. Biometric Devices Tab */}
        {isHR() && activeTab === "devices" && (
          <DataTable
            columns={[
              { key: "deviceId", label: "Device ID" },
              { key: "deviceName", label: "Device Name" },
              { key: "ipAddress", label: "IP Address", render: (val, row) => `${val}:${row.port}` },
              { key: "location", label: "Location" },
              { 
                key: "connectionStatus", 
                label: "Connection", 
                render: (val) => (
                  <Badge 
                    status={val === "CONNECTED" ? "PRESENT" : "ABSENT"} 
                    label={val} 
                  />
                ) 
              },
              { 
                key: "status", 
                label: "Status", 
                render: (val) => (
                  <Badge 
                    status={val === "ACTIVE" ? "PRESENT" : "ABSENT"} 
                    label={val} 
                  />
                ) 
              },
              { key: "lastSyncTime", label: "Last Sync Time", render: (val) => val ? new Date(val).toLocaleString() : "Never" }
            ]}
            data={devices}
            actions={(row) => (
              <div className="flex items-center gap-1.5 ml-auto">
                <button
                  onClick={() => handleTestDeviceConnection(row.id)}
                  className="p-1 rounded text-emerald-500 hover:bg-emerald-500/10 transition-colors"
                  title="Test Connection"
                >
                  <WifiHigh size={15} />
                </button>
                <button
                  onClick={() => handleSyncDeviceLogs(row.id)}
                  className="p-1 rounded text-amber-500 hover:bg-amber-500/10 transition-colors"
                  title="Sync Log Records"
                >
                  <Clock size={15} />
                </button>
                <button
                  onClick={() => {
                    setEditingDevice(row);
                    setDeviceForm(row);
                    setIsDeviceOpen(true);
                  }}
                  className="p-1 rounded text-blue-500 hover:bg-blue-500/10 transition-colors"
                  title="Edit Device"
                >
                  <PencilSimpleLine size={15} />
                </button>
                <button
                  onClick={() => handleDeleteDevice(row.id)}
                  className="p-1 rounded text-red-500 hover:bg-red-500/10 transition-colors"
                  title="Remove Device"
                >
                  <Trash size={15} />
                </button>
              </div>
            )}
          />
        )}

        {/* 3. Biometric Enrollment Tab */}
        {isHR() && activeTab === "enrollment" && (
          <DataTable
            columns={[
              { key: "employee", label: "Employee Name", render: (val) => val?.employeeName || "—" },
              { key: "biometricType", label: "Type" },
              { key: "cardId", label: "Card ID / RFID" },
              { 
                key: "enabled", 
                label: "State", 
                render: (val) => (
                  <Badge 
                    status={val ? "PRESENT" : "ABSENT"} 
                    label={val ? "ACTIVE" : "DISABLED"} 
                  />
                ) 
              },
              { key: "lastSyncedAt", label: "Last Sync", render: (val) => val ? new Date(val).toLocaleString() : "Never" }
            ]}
            data={enrollments}
            actions={(row) => (
              <div className="flex items-center gap-1.5 ml-auto">
                <button
                  onClick={() => handleToggleEnrollment(row.id)}
                  className={`p-1 rounded transition-colors ${row.enabled ? "text-amber-500 hover:bg-amber-550/10" : "text-emerald-500 hover:bg-emerald-500/10"}`}
                  title={row.enabled ? "Disable Biometric" : "Enable Biometric"}
                >
                  {row.enabled ? <Prohibit size={15} /> : <CheckCircle size={15} />}
                </button>
                <button
                  onClick={() => handleDeleteEnrollment(row.id)}
                  className="p-1 rounded text-red-500 hover:bg-red-500/10 transition-colors"
                  title="Remove Biometric"
                >
                  <Trash size={15} />
                </button>
              </div>
            )}
          />
        )}

        {/* 4. Shift & Holidays Tab */}
        {isHR() && activeTab === "shifts" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 font-mono">Shift Profiles</h3>
              </div>
              <DataTable
                columns={[
                  { key: "shiftName", label: "Shift Name" },
                  { key: "startTime", label: "Start", render: (val) => val ? val.substring(0, 5) : "—" },
                  { key: "endTime", label: "End", render: (val) => val ? val.substring(0, 5) : "—" },
                  { key: "graceTimeMinutes", label: "Grace Time", render: (val) => `${val} mins` }
                ]}
                data={shifts}
                actions={(row) => (
                  <button
                    onClick={() => handleDeleteShift(row.id)}
                    className="p-1 rounded text-red-500 hover:bg-red-500/10 transition-colors"
                    title="Remove Shift"
                  >
                    <Trash size={15} />
                  </button>
                )}
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 font-mono">Public Holidays</h3>
              </div>
              <DataTable
                columns={[
                  { key: "holidayName", label: "Holiday" },
                  { key: "holidayDate", label: "Date", render: (val) => new Date(val).toLocaleDateString() },
                  { key: "nationalHoliday", label: "Type", render: (val) => val ? "National" : "Optional" }
                ]}
                data={holidays}
                actions={(row) => (
                  <button
                    onClick={() => handleDeleteHoliday(row.id)}
                    className="p-1 rounded text-red-500 hover:bg-red-500/10 transition-colors"
                    title="Remove Holiday"
                  >
                    <Trash size={15} />
                  </button>
                )}
              />
            </div>
          </div>
        )}

        {/* 5. Corrections Tab */}
        {activeTab === "corrections" || (!isHR() && activeTab === "logs") ? (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 font-mono">Manual Corrections Queue</h3>
            </div>
            <DataTable
              columns={[
                { key: "employee", label: "Employee Name", render: (val) => val?.employeeName || user?.name || "—" },
                { key: "attendanceDate", label: "Date", render: (val) => new Date(val).toLocaleDateString() },
                { key: "correctedCheckIn", label: "Corrected In", render: (val) => val ? val.substring(0, 5) : "—" },
                { key: "correctedCheckOut", label: "Corrected Out", render: (val) => val ? val.substring(0, 5) : "—" },
                { 
                  key: "status", 
                  label: "Status", 
                  render: (val) => (
                    <Badge 
                      status={val === "APPROVED" ? "PRESENT" : (val === "REJECTED" ? "ABSENT" : "ON_LEAVE")} 
                      label={val} 
                    />
                  ) 
                },
                { key: "reason", label: "Reason" }
              ]}
              data={corrections}
              actions={(row) => {
                if (isHR() && row.status === "PENDING") {
                  return (
                    <div className="flex items-center gap-1.5 ml-auto">
                      <button
                        onClick={() => handleApproveCorrection(row.id)}
                        className="px-2 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded text-[11px] font-semibold transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleRejectCorrection(row.id)}
                        className="px-2 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded text-[11px] font-semibold transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  );
                }
                return null;
              }}
            />
          </div>
        ) : null}

        {/* MODALS */}

        {/* 1. Device Modal */}
        <Modal
          isOpen={isDeviceOpen}
          onClose={() => { setIsDeviceOpen(false); setEditingDevice(null); }}
          title={editingDevice ? "Edit Biometric Device" : "Add Biometric Device"}
          size="md"
        >
          <form onSubmit={handleSaveDevice} className="space-y-4 font-body text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider font-mono">Device ID *</label>
                <input
                  type="text"
                  required
                  disabled={!!editingDevice}
                  value={deviceForm.deviceId}
                  onChange={(e) => setDeviceForm({ ...deviceForm, deviceId: e.target.value })}
                  className="input-field"
                  placeholder="e.g. DEVICE_MAIN_01"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider font-mono">Device Name *</label>
                <input
                  type="text"
                  required
                  value={deviceForm.deviceName}
                  onChange={(e) => setDeviceForm({ ...deviceForm, deviceName: e.target.value })}
                  className="input-field"
                  placeholder="e.g. Whitefield Reception"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider font-mono">IP Address *</label>
                <input
                  type="text"
                  required
                  value={deviceForm.ipAddress}
                  onChange={(e) => setDeviceForm({ ...deviceForm, ipAddress: e.target.value })}
                  className="input-field font-mono"
                  placeholder="e.g. 192.168.1.201"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider font-mono">Port *</label>
                <input
                  type="number"
                  required
                  value={deviceForm.port}
                  onChange={(e) => setDeviceForm({ ...deviceForm, port: parseInt(e.target.value) })}
                  className="input-field font-mono"
                  placeholder="4370"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider font-mono">Location</label>
                <input
                  type="text"
                  value={deviceForm.location}
                  onChange={(e) => setDeviceForm({ ...deviceForm, location: e.target.value })}
                  className="input-field"
                  placeholder="e.g. Ground Floor Entrance"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider font-mono">Serial Number</label>
                <input
                  type="text"
                  value={deviceForm.serialNumber}
                  onChange={(e) => setDeviceForm({ ...deviceForm, serialNumber: e.target.value })}
                  className="input-field font-mono"
                  placeholder="e.g. ZK9500123456"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <Button type="button" variant="secondary" onClick={() => { setIsDeviceOpen(false); setEditingDevice(null); }}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Save Device Configuration
              </Button>
            </div>
          </form>
        </Modal>

        {/* 2. Enrollment Modal */}
        <Modal
          isOpen={isEnrollOpen}
          onClose={() => setIsEnrollOpen(false)}
          title="Enroll Employee Biometric"
          size="md"
        >
          <form onSubmit={handleSaveEnrollment} className="space-y-4 font-body text-xs">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider font-mono">Select Employee *</label>
              <select
                required
                value={enrollForm.employeeId}
                onChange={(e) => setEnrollForm({ ...enrollForm, employeeId: e.target.value })}
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider font-mono">Biometric Type *</label>
                <select
                  required
                  value={enrollForm.biometricType}
                  onChange={(e) => setEnrollForm({ ...enrollForm, biometricType: e.target.value })}
                  className="select-field"
                >
                  <option value="CARD">RFID Card</option>
                  <option value="FINGERPRINT">Fingerprint</option>
                  <option value="FACE">Face Hash</option>
                  <option value="IRIS">Iris Pattern</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider font-mono">Card ID / Value</label>
                <input
                  type="text"
                  value={enrollForm.cardId}
                  onChange={(e) => setEnrollForm({ ...enrollForm, cardId: e.target.value })}
                  className="input-field font-mono"
                  placeholder="e.g. CARD_909503"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider font-mono">Biometric Template</label>
              <textarea
                value={enrollForm.biometricTemplate}
                onChange={(e) => setEnrollForm({ ...enrollForm, biometricTemplate: e.target.value })}
                className="input-field h-20 font-mono resize-none"
                placeholder="Template hash values..."
              />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <Button type="button" variant="secondary" onClick={() => setIsEnrollOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Enroll Credentials
              </Button>
            </div>
          </form>
        </Modal>

        {/* 3. Shift Modal */}
        <Modal
          isOpen={isShiftOpen}
          onClose={() => setIsShiftOpen(false)}
          title="Configure Shift Profile"
          size="md"
        >
          <form onSubmit={handleSaveShift} className="space-y-4 font-body text-xs">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider font-mono">Shift Name *</label>
              <input
                type="text"
                required
                value={shiftForm.shiftName}
                onChange={(e) => setShiftForm({ ...shiftForm, shiftName: e.target.value })}
                className="input-field"
                placeholder="e.g. Day Shift, Night Shift, Split Shift"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider font-mono">Start Time *</label>
                <input
                  type="time"
                  required
                  value={shiftForm.startTime}
                  onChange={(e) => setShiftForm({ ...shiftForm, startTime: e.target.value })}
                  className="input-field font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider font-mono">End Time *</label>
                <input
                  type="time"
                  required
                  value={shiftForm.endTime}
                  onChange={(e) => setShiftForm({ ...shiftForm, endTime: e.target.value })}
                  className="input-field font-mono"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider font-mono">Grace Time (mins)</label>
                <input
                  type="number"
                  value={shiftForm.graceTimeMinutes}
                  onChange={(e) => setShiftForm({ ...shiftForm, graceTimeMinutes: parseInt(e.target.value) })}
                  className="input-field font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider font-mono">Half Day Limit (hrs)</label>
                <input
                  type="number"
                  step="0.5"
                  value={shiftForm.halfDayThresholdHours}
                  onChange={(e) => setShiftForm({ ...shiftForm, halfDayThresholdHours: parseFloat(e.target.value) })}
                  className="input-field font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider font-mono">Full Day Limit (hrs)</label>
                <input
                  type="number"
                  step="0.5"
                  value={shiftForm.fullDayHours}
                  onChange={(e) => setShiftForm({ ...shiftForm, fullDayHours: parseFloat(e.target.value) })}
                  className="input-field font-mono"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <Button type="button" variant="secondary" onClick={() => setIsShiftOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Save Shift Timing
              </Button>
            </div>
          </form>
        </Modal>

        {/* 4. Holiday Modal */}
        <Modal
          isOpen={isHolidayOpen}
          onClose={() => setIsHolidayOpen(false)}
          title="Register Public Holiday"
          size="md"
        >
          <form onSubmit={handleSaveHoliday} className="space-y-4 font-body text-xs">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider font-mono">Holiday Description *</label>
              <input
                type="text"
                required
                value={holidayForm.holidayName}
                onChange={(e) => setHolidayForm({ ...holidayForm, holidayName: e.target.value })}
                className="input-field"
                placeholder="e.g. Independence Day, Christmas"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider font-mono">Date *</label>
                <input
                  type="date"
                  required
                  value={holidayForm.holidayDate}
                  onChange={(e) => setHolidayForm({ ...holidayForm, holidayDate: e.target.value })}
                  className="input-field font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider font-mono">Holiday Type *</label>
                <select
                  required
                  value={holidayForm.isNationalHoliday}
                  onChange={(e) => setHolidayForm({ ...holidayForm, isNationalHoliday: e.target.value === "true" })}
                  className="select-field"
                >
                  <option value="true">National Holiday (Mandatory)</option>
                  <option value="false">Optional Holiday</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <Button type="button" variant="secondary" onClick={() => setIsHolidayOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Register Holiday
              </Button>
            </div>
          </form>
        </Modal>

        {/* 5. Correction Request Modal */}
        <Modal
          isOpen={isCorrectionOpen}
          onClose={() => setIsCorrectionOpen(false)}
          title="Apply for Attendance Correction"
          size="md"
        >
          <form onSubmit={handleSaveCorrection} className="space-y-4 font-body text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider font-mono">Date *</label>
                <input
                  type="date"
                  required
                  value={correctionForm.attendanceDate}
                  onChange={(e) => setCorrectionForm({ ...correctionForm, attendanceDate: e.target.value })}
                  className="input-field font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider font-mono">Employee ID *</label>
                <input
                  type="text"
                  required
                  disabled
                  value={correctionForm.employeeId}
                  className="input-field font-mono"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider font-mono">Corrected Check In Time *</label>
                <input
                  type="time"
                  required
                  value={correctionForm.correctedCheckIn}
                  onChange={(e) => setCorrectionForm({ ...correctionForm, correctedCheckIn: e.target.value })}
                  className="input-field font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider font-mono">Corrected Check Out Time *</label>
                <input
                  type="time"
                  required
                  value={correctionForm.correctedCheckOut}
                  onChange={(e) => setCorrectionForm({ ...correctionForm, correctedCheckOut: e.target.value })}
                  className="input-field font-mono"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider font-mono">Reason for Correction *</label>
              <textarea
                required
                value={correctionForm.reason}
                onChange={(e) => setCorrectionForm({ ...correctionForm, reason: e.target.value })}
                className="input-field h-20 resize-none"
                placeholder="e.g. Forgot RFID card, Card reader device error at front lobby..."
              />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <Button type="button" variant="secondary" onClick={() => setIsCorrectionOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Submit Request
              </Button>
            </div>
          </form>
        </Modal>

        {/* Original Manual Log / Edit Modal */}
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
              <Button type="button" variant="secondary" onClick={() => { setIsManualOpen(false); setIsEditOpen(false); }}>
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
