import { useEffect, useMemo, useState } from "react";
import { BellRing, CalendarDays, Download, LogOut, MessageSquare, Phone, Search, ShieldCheck, Sparkles, UserCircle } from "lucide-react";

type ContactStatus = "new" | "contacted" | "matched" | "not-interested";
type LeadStatus = "new" | "follow-up" | "qualified" | "closed";
type LeadPriority = "low" | "medium" | "high" | "urgent";
type ActivityType = "call" | "whatsapp" | "email" | "note" | "status-change" | "system";

interface LeadActivityEntry {
  id: string;
  type: ActivityType;
  message: string;
  createdAt: string;
  actor?: string;
}

interface AdminLead {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  companyName?: string;
  landType: string;
  intendedUse: string;
  preferredState: string;
  preferredLga: string;
  minSize: string;
  maxBudget: string;
  leaseDuration: string;
  additionalRequirements: string;
  submittedAt: string;
  contactStatus: ContactStatus;
  status: LeadStatus;
  internalNotes: string;
  assignee: string;
  priority: LeadPriority;
  tags: string[];
  followUpDate: string | null;
  reminderEnabled: boolean;
  reminderSentAt: string | null;
  activityHistory: LeadActivityEntry[];
}

const CONTACT_OPTIONS: Array<{ value: "all" | ContactStatus; label: string }> = [
  { value: "all", label: "All contact stages" },
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "matched", label: "Matched" },
  { value: "not-interested", label: "Not interested" },
];

function formatDate(value?: string | null) {
  if (!value) return "Not scheduled";

  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

const PRIORITY_OPTIONS: Array<{ value: LeadPriority; label: string }> = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

const TAG_OPTIONS = ["Agriculture", "Storage", "Events", "Industrial", "Renewable", "Construction", "Research", "Logistics"];
const STAFF_OPTIONS = ["Amina", "Kelechi", "Tunde", "Nneka", "Seyi"];

export default function AdminDashboard() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("fieldlease_admin_token"));
  const [username, setUsername] = useState<string | null>(() => localStorage.getItem("fieldlease_admin_user"));
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [leads, setLeads] = useState<AdminLead[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [contactFilter, setContactFilter] = useState<"all" | ContactStatus>("all");
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [assigneeDraft, setAssigneeDraft] = useState("");
  const [priorityDraft, setPriorityDraft] = useState<LeadPriority>("medium");
  const [tagsDraft, setTagsDraft] = useState<string[]>([]);
  const [followUpDateDraft, setFollowUpDateDraft] = useState("");
  const [reminderEnabledDraft, setReminderEnabledDraft] = useState(false);
  const [activityTypeDraft, setActivityTypeDraft] = useState<ActivityType>("call");
  const [activityMessageDraft, setActivityMessageDraft] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchLeads = async () => {
    if (!token) return;

    try {
      setLoading(true);
      setFeedbackMessage(null);
      const response = await fetch("/api/admin/leads", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "We couldn’t load the lead list right now. Please refresh and try again.");
      }

      const data = await response.json();
      setLeads(data.leads || []);
      if (data.leads?.length) {
        setSelectedLeadId((current) => current || data.leads[0].id);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "We couldn’t load the lead list right now. Please refresh and try again.";
      setFeedbackMessage(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchLeads();
  }, [token]);

  useEffect(() => {
    if (!token) return;

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        void fetchLeads();
      }
    };

    window.addEventListener("focus", handleVisibility);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.removeEventListener("focus", handleVisibility);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [token]);

  const filteredLeads = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return leads.filter((lead) => {
      const matchesContact = contactFilter === "all" || lead.contactStatus === contactFilter;
      if (!matchesContact) return false;

      if (!query) return true;

      return [
        lead.fullName,
        lead.email,
        lead.phone,
        lead.companyName,
        lead.landType,
        lead.intendedUse,
        lead.preferredState,
        lead.preferredLga,
        lead.additionalRequirements,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));
    });
  }, [contactFilter, leads, searchTerm]);

  const summary = useMemo(() => {
    const total = leads.length;
    const newLeads = leads.filter((lead) => lead.contactStatus === "new").length;
    const contacted = leads.filter((lead) => lead.contactStatus === "contacted").length;
    const matched = leads.filter((lead) => lead.contactStatus === "matched").length;

    return { total, newLeads, contacted, matched };
  }, [leads]);

  const selectedLead = filteredLeads.find((lead) => lead.id === selectedLeadId) || filteredLeads[0] || null;

  useEffect(() => {
    if (selectedLead) {
      setNoteDraft(selectedLead.internalNotes || "");
      setAssigneeDraft(selectedLead.assignee || "");
      setPriorityDraft(selectedLead.priority || "medium");
      setTagsDraft(selectedLead.tags || []);
      setFollowUpDateDraft(selectedLead.followUpDate || "");
      setReminderEnabledDraft(Boolean(selectedLead.reminderEnabled));
    }
  }, [selectedLead]);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoginError("");
    setFeedbackMessage(null);
    setLoading(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginForm),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      localStorage.setItem("fieldlease_admin_token", data.token);
      localStorage.setItem("fieldlease_admin_user", data.username);
      setToken(data.token);
      setUsername(data.username);
      setFeedbackMessage("Signed in successfully.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "The username or password you entered is incorrect.";
      setLoginError(message);
    } finally {
      setLoading(false);
    }
  };

  const updateLead = async (leadId: string, patch: Partial<AdminLead>) => {
    if (!token) return false;

    setSaving(true);
    try {
      const response = await fetch(`/api/admin/leads/${leadId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(patch),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "We couldn’t update this lead right now. Please try again.");
      }

      setLeads((current) => current.map((lead) => (lead.id === leadId ? data.lead : lead)));
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : "We couldn’t update this lead right now. Please try again.";
      setFeedbackMessage(message);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const createActivityEntry = (type: ActivityType, message: string): LeadActivityEntry => ({
    id: `${selectedLead?.id || "lead"}-${Date.now()}`,
    type,
    message,
    createdAt: new Date().toISOString(),
  });

  const handleSaveWorkflow = async () => {
    if (!selectedLead) return;
    const saved = await updateLead(selectedLead.id, {
      internalNotes: noteDraft,
      assignee: assigneeDraft,
      priority: priorityDraft,
      tags: tagsDraft,
      followUpDate: followUpDateDraft || null,
      reminderEnabled: reminderEnabledDraft,
    });

    if (saved) {
      setFeedbackMessage("Workflow details saved successfully.");
    }
  };

  const handleAddActivity = async () => {
    if (!selectedLead || !activityMessageDraft.trim()) return;

    const entry = createActivityEntry(activityTypeDraft, activityMessageDraft.trim());
    const saved = await updateLead(selectedLead.id, {
      activityHistory: [entry, ...(selectedLead.activityHistory || [])],
    });

    if (saved) {
      setFeedbackMessage("Activity added to the lead history.");
      setActivityMessageDraft("");
    }
  };

  const handleStatusChange = async (nextStatus: ContactStatus) => {
    if (!selectedLead) return;

    const entry = createActivityEntry("status-change", `Contact status changed to ${nextStatus}`);
    const saved = await updateLead(selectedLead.id, {
      contactStatus: nextStatus,
      activityHistory: [entry, ...(selectedLead.activityHistory || [])],
    });

    if (saved) {
      setFeedbackMessage("Lead status updated.");
    }
  };

  const handleReminder = async () => {
    if (!selectedLead) return;

    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "default") {
      await Notification.requestPermission();
    }

    const canNotify = typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted";
    if (canNotify) {
      new Notification("FieldLease follow-up reminder", {
        body: `${selectedLead.fullName} is due for follow-up today.`,
      });
    } else if (typeof window !== "undefined") {
      window.alert(`Reminder queued for ${selectedLead.fullName}`);
    }

    const saved = await updateLead(selectedLead.id, {
      reminderSentAt: new Date().toISOString(),
    });

    if (saved) {
      setFeedbackMessage("Reminder recorded for the selected lead.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("fieldlease_admin_token");
    localStorage.removeItem("fieldlease_admin_user");
    setToken(null);
    setUsername(null);
    setLeads([]);
    setSelectedLeadId(null);
    setFeedbackMessage(null);
  };

  const exportCsv = () => {
    const rows = filteredLeads.map((lead) => [
      lead.fullName,
      lead.email,
      lead.phone,
      lead.companyName || "",
      lead.landType,
      lead.intendedUse,
      lead.preferredState,
      lead.preferredLga,
      lead.contactStatus,
      lead.status,
      lead.priority,
      lead.assignee || "Unassigned",
      lead.tags.join(", "),
      lead.followUpDate || "",
      lead.reminderEnabled ? "Yes" : "No",
      lead.internalNotes.replace(/\n/g, " "),
      lead.submittedAt,
    ]);

    const csvHeader = [
      "Name",
      "Email",
      "Phone",
      "Company",
      "Land Type",
      "Intended Use",
      "State",
      "LGA",
      "Contact Status",
      "Internal Status",
      "Priority",
      "Assigned To",
      "Tags",
      "Follow-up Date",
      "Reminder Enabled",
      "Notes",
      "Submitted At",
    ];

    const csvContent = [csvHeader, ...rows]
      .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "fieldlease-leads.csv";
    link.click();
    URL.revokeObjectURL(link.href);
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-slate-950 px-4 py-16 text-white">
        <div className="mx-auto flex max-w-md flex-col rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl shadow-black/30">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-400">FieldLease Admin</p>
              <h1 className="text-2xl font-bold">Secure access required</h1>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <label className="block text-sm">
              <span className="mb-2 block text-slate-300">Username</span>
              <input
                value={loginForm.username}
                onChange={(event) => setLoginForm((current) => ({ ...current, username: event.target.value }))}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none ring-0"
                placeholder="admin"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-2 block text-slate-300">Password</span>
              <input
                type="password"
                value={loginForm.password}
                onChange={(event) => setLoginForm((current) => ({ ...current, password: event.target.value }))}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none ring-0"
                placeholder="Enter your password"
              />
            </label>
            {loginError ? <p className="text-sm text-rose-400">{loginError}</p> : null}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 text-slate-800 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-600">FieldLease Admin</p>
            <h1 className="mt-1 text-3xl font-bold text-slate-900">Lead operations dashboard</h1>
            <p className="mt-2 text-sm text-slate-500">Monitor submissions, update follow-up status, and keep internal notes aligned with each request.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              <div className="flex items-center gap-2 font-semibold text-slate-900">
                <UserCircle className="h-4 w-4 text-emerald-600" />
                {username || "Admin"}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </header>

        {feedbackMessage ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            {feedbackMessage}
          </div>
        ) : null}

        <section className="grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Total leads</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{summary.total}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">New leads</p>
            <p className="mt-2 text-3xl font-bold text-emerald-600">{summary.newLeads}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Contacted</p>
            <p className="mt-2 text-3xl font-bold text-sky-600">{summary.contacted}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Matched</p>
            <p className="mt-2 text-3xl font-bold text-violet-600">{summary.matched}</p>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Recent requests</h2>
                <p className="text-sm text-slate-500">Search, filter, and track each lead.</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => void fetchLeads()}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  <Sparkles className="h-4 w-4" />
                  Refresh
                </button>
                <button
                  onClick={exportCsv}
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  <Download className="h-4 w-4" />
                  Export CSV
                </button>
              </div>
            </div>

            <div className="mb-4 flex flex-col gap-3 lg:flex-row">
              <label className="flex flex-1 items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-600">
                <Search className="h-4 w-4" />
                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search by name, location, use case..."
                  className="w-full bg-transparent outline-none"
                />
              </label>
              <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-600">
                <Sparkles className="h-4 w-4" />
                <select
                  value={contactFilter}
                  onChange={(event) => setContactFilter(event.target.value as "all" | ContactStatus)}
                  className="bg-transparent outline-none"
                >
                  {CONTACT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {loading ? (
              <p className="text-sm text-slate-500">Loading leads...</p>
            ) : filteredLeads.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
                No leads match this filter yet.
              </div>
            ) : (
              <div className="space-y-3">
                {filteredLeads.map((lead) => (
                  <button
                    key={lead.id}
                    onClick={() => {
                      setSelectedLeadId(lead.id);
                      setNoteDraft(lead.internalNotes || "");
                    }}
                    className={`w-full rounded-2xl border p-4 text-left transition ${selectedLead?.id === lead.id ? "border-emerald-500 bg-emerald-50/70" : "border-slate-200 bg-white hover:border-slate-300"}`}
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-semibold text-slate-900">{lead.fullName}</p>
                        <p className="text-sm text-slate-500">{lead.intendedUse}</p>
                      </div>
                      <div className="text-sm text-slate-500">
                        <p>{lead.preferredState}</p>
                        <p>{lead.preferredLga}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-600">{lead.landType}</span>
                      <span className="rounded-full bg-emerald-100 px-2.5 py-1 font-medium text-emerald-700">{lead.contactStatus}</span>
                      <span className="rounded-full bg-amber-100 px-2.5 py-1 font-medium text-amber-700">{lead.priority}</span>
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-600">{formatDate(lead.submittedAt)}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            {selectedLead ? (
              <div className="space-y-5">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-600">Lead details</p>
                  <h2 className="mt-1 text-2xl font-bold text-slate-900">{selectedLead.fullName}</h2>
                  <p className="mt-1 text-sm text-slate-500">Submitted {formatDate(selectedLead.submittedAt)}</p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Email</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">{selectedLead.email}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Phone</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">{selectedLead.phone}</p>
                  </div>
                </div>

                <div className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                  <p><span className="font-semibold text-slate-900">Land type:</span> {selectedLead.landType}</p>
                  <p><span className="font-semibold text-slate-900">Use case:</span> {selectedLead.intendedUse}</p>
                  <p><span className="font-semibold text-slate-900">Location:</span> {selectedLead.preferredState}, {selectedLead.preferredLga}</p>
                  <p><span className="font-semibold text-slate-900">Budget:</span> {selectedLead.maxBudget || "Not provided"}</p>
                  <p><span className="font-semibold text-slate-900">Lease duration:</span> {selectedLead.leaseDuration || "Not provided"}</p>
                  <p><span className="font-semibold text-slate-900">Extra requirements:</span> {selectedLead.additionalRequirements || "None"}</p>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm">
                    <span className="mb-2 block font-semibold text-slate-700">Contact status</span>
                    <select
                      value={selectedLead.contactStatus}
                      onChange={(event) => void handleStatusChange(event.target.value as ContactStatus)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none"
                    >
                      {CONTACT_OPTIONS.filter((option) => option.value !== "all").map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center gap-2 font-semibold text-slate-900">
                      <CalendarDays className="h-4 w-4 text-emerald-600" />
                      Workflow details
                    </div>
                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                      <label className="text-sm text-slate-600">
                        <span className="mb-2 block font-semibold text-slate-700">Assignee</span>
                        <select
                          value={assigneeDraft}
                          onChange={(event) => setAssigneeDraft(event.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none"
                        >
                          <option value="">Unassigned</option>
                          {STAFF_OPTIONS.map((staff) => (
                            <option key={staff} value={staff}>
                              {staff}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="text-sm text-slate-600">
                        <span className="mb-2 block font-semibold text-slate-700">Priority</span>
                        <select
                          value={priorityDraft}
                          onChange={(event) => setPriorityDraft(event.target.value as LeadPriority)}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none"
                        >
                          {PRIORITY_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="text-sm text-slate-600">
                        <span className="mb-2 block font-semibold text-slate-700">Follow-up date</span>
                        <input
                          type="date"
                          value={followUpDateDraft}
                          onChange={(event) => setFollowUpDateDraft(event.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none"
                        />
                      </label>
                      <label className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700">
                        <span>Reminder</span>
                        <input
                          type="checkbox"
                          checked={reminderEnabledDraft}
                          onChange={(event) => setReminderEnabledDraft(event.target.checked)}
                          className="h-4 w-4 rounded border-slate-300 text-emerald-600"
                        />
                      </label>
                    </div>

                    <div className="mt-3">
                      <p className="mb-2 text-sm font-semibold text-slate-700">Tags</p>
                      <div className="flex flex-wrap gap-2">
                        {TAG_OPTIONS.map((tag) => {
                          const active = tagsDraft.includes(tag);
                          return (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => setTagsDraft((current) => (current.includes(tag) ? current.filter((value) => value !== tag) : [...current, tag]))}
                              className={`rounded-full px-3 py-1 text-sm font-medium ${active ? "bg-emerald-600 text-white" : "bg-white text-slate-600"}`}
                            >
                              {tag}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <button
                      onClick={() => void handleSaveWorkflow()}
                      disabled={saving}
                      className="mt-4 w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {saving ? "Saving..." : "Save workflow"}
                    </button>
                  </div>

                  <label className="block text-sm">
                    <span className="mb-2 block font-semibold text-slate-700">Internal notes</span>
                    <textarea
                      value={noteDraft}
                      onChange={(event) => setNoteDraft(event.target.value)}
                      rows={6}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none"
                      placeholder="Add call notes, next steps, or follow-up reminders..."
                    />
                  </label>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                  <div className="flex items-center gap-2 font-semibold text-slate-900">
                    <BellRing className="h-4 w-4 text-emerald-600" />
                    Follow-up and reminders
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-white px-3 py-1 font-medium text-slate-600">{selectedLead.followUpDate ? formatDate(selectedLead.followUpDate) : "No follow-up date"}</span>
                    {selectedLead.reminderEnabled ? <span className="rounded-full bg-emerald-100 px-3 py-1 font-medium text-emerald-700">Reminder enabled</span> : null}
                  </div>
                  {selectedLead.reminderEnabled && selectedLead.followUpDate ? (
                    <button
                      onClick={() => void handleReminder()}
                      className="mt-3 inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-2 text-sm font-semibold text-white"
                    >
                      <BellRing className="h-4 w-4" />
                      Send reminder
                    </button>
                  ) : null}
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                  <div className="flex items-center gap-2 font-semibold text-slate-900">
                    <MessageSquare className="h-4 w-4 text-emerald-600" />
                    Activity history
                  </div>
                  <div className="mt-3 space-y-2">
                    {(selectedLead.activityHistory || []).slice(0, 6).map((entry) => (
                      <div key={entry.id} className="rounded-xl border border-slate-200 bg-white p-3">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-slate-900">{entry.message}</p>
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.2em] text-slate-600">{entry.type}</span>
                        </div>
                        <p className="mt-1 text-xs text-slate-500">{formatDate(entry.createdAt)}</p>
                      </div>
                    ))}
                    {!selectedLead.activityHistory?.length ? <p className="text-sm text-slate-500">No activity entries yet.</p> : null}
                  </div>
                  <div className="mt-3 space-y-2">
                    <label className="block text-sm">
                      <span className="mb-2 block font-semibold text-slate-700">Add activity</span>
                      <select
                        value={activityTypeDraft}
                        onChange={(event) => setActivityTypeDraft(event.target.value as ActivityType)}
                        className="mb-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none"
                      >
                        <option value="call">Call</option>
                        <option value="whatsapp">WhatsApp</option>
                        <option value="email">Email</option>
                        <option value="note">Note</option>
                        <option value="status-change">Status change</option>
                        <option value="system">System</option>
                      </select>
                      <textarea
                        value={activityMessageDraft}
                        onChange={(event) => setActivityMessageDraft(event.target.value)}
                        rows={3}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none"
                        placeholder="Capture the call outcome, message, or next step..."
                      />
                    </label>
                    <button
                      onClick={() => void handleAddActivity()}
                      className="rounded-full bg-slate-900 px-3 py-2 text-sm font-semibold text-white"
                    >
                      Add activity
                    </button>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                  <div className="flex items-center gap-2 font-semibold text-slate-900">
                    <MessageSquare className="h-4 w-4 text-emerald-600" />
                    Quick actions
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <a href={`tel:${selectedLead.phone}`} className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm">
                      <Phone className="h-4 w-4 text-emerald-600" />
                      Call
                    </a>
                    <a href={`https://wa.me/${selectedLead.phone.replace(/[^0-9]/g, "")}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-3 py-2 text-sm font-semibold text-white">
                      <MessageSquare className="h-4 w-4" />
                      WhatsApp
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
                Select a lead to review notes and update status.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
