import { useEffect, useMemo, useState } from "react";
import { Download, LogOut, MessageSquare, Phone, Search, ShieldCheck, Sparkles, UserCircle } from "lucide-react";

type ContactStatus = "new" | "contacted" | "matched" | "not-interested";
type LeadStatus = "new" | "follow-up" | "qualified" | "closed";

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
}

const CONTACT_OPTIONS: Array<{ value: "all" | ContactStatus; label: string }> = [
  { value: "all", label: "All contact stages" },
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "matched", label: "Matched" },
  { value: "not-interested", label: "Not interested" },
];

function formatDate(value: string) {
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function AdminDashboard() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("fieldlease_admin_token"));
  const [username, setUsername] = useState<string | null>(() => localStorage.getItem("fieldlease_admin_user"));
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [loading, setLoading] = useState(false);
  const [leads, setLeads] = useState<AdminLead[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [contactFilter, setContactFilter] = useState<"all" | ContactStatus>("all");
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!token) return;

    const fetchLeads = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/admin/leads", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error("Unable to load leads");
        }

        const data = await response.json();
        setLeads(data.leads || []);
        if (data.leads?.length) {
          setSelectedLeadId((current) => current || data.leads[0].id);
        }
      } catch (error) {
        setLoginError(error instanceof Error ? error.message : "Unable to load leads");
      } finally {
        setLoading(false);
      }
    };

    void fetchLeads();
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
    }
  }, [selectedLead]);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoginError("");
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
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const updateLead = async (leadId: string, patch: Partial<AdminLead>) => {
    if (!token) return;

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
        throw new Error(data.error || "Update failed");
      }

      setLeads((current) => current.map((lead) => (lead.id === leadId ? data.lead : lead)));
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedLead) return;
    await updateLead(selectedLead.id, { internalNotes: noteDraft });
  };

  const handleStatusChange = async (nextStatus: ContactStatus) => {
    if (!selectedLead) return;
    await updateLead(selectedLead.id, { contactStatus: nextStatus });
  };

  const handleLogout = () => {
    localStorage.removeItem("fieldlease_admin_token");
    localStorage.removeItem("fieldlease_admin_user");
    setToken(null);
    setUsername(null);
    setLeads([]);
    setSelectedLeadId(null);
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

          <p className="mt-4 text-center text-xs text-slate-400">
            Default login is admin / fieldlease2026 unless you override it in environment variables.
          </p>
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
              <button
                onClick={exportCsv}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                <Download className="h-4 w-4" />
                Export CSV
              </button>
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

                  <label className="block text-sm">
                    <span className="mb-2 block font-semibold text-slate-700">Internal notes</span>
                    <textarea
                      value={noteDraft}
                      onChange={(event) => setNoteDraft(event.target.value)}
                      rows={6}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none"
                      placeholder="Add call notes, next steps, priority, or follow-up reminders..."
                    />
                  </label>

                  <button
                    onClick={() => void handleSaveNotes()}
                    disabled={saving}
                    className="w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {saving ? "Saving..." : "Save notes"}
                  </button>
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
