import { type ChangeEvent, type FormEvent, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  BellRing,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock,
  Download,
  FileText,
  FileUp,
  LayoutDashboard,
  LogOut,
  Mail,
  MessageSquare,
  Phone,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Tag,
  Trash2,
  UserCheck,
  UserCircle,
  Users,
} from "lucide-react";

type PipelineStatus = "new" | "contacted" | "searching" | "matched" | "closed";
type LeadStatus = "new" | "follow-up" | "qualified" | "closed";
type LeadPriority = "low" | "medium" | "high" | "urgent";
type ActivityType = "call" | "whatsapp" | "email" | "note" | "status-change" | "system" | "document" | "reminder" | "assignment";
type DashboardView = "pipeline" | "desk" | "analytics";

interface LeadActivityEntry {
  id: string;
  type: ActivityType;
  message: string;
  createdAt: string;
  actor?: string;
}

interface LeadDocument {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: string;
  uploadedBy?: string;
  dataUrl?: string;
}

interface LeadNotificationEntry {
  id: string;
  channel: "email" | "whatsapp";
  recipient: string;
  subject?: string;
  message: string;
  status: string;
  sentAt: string;
  actor?: string;
}

interface AdminLead {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  whatsapp?: string;
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
  contactStatus: PipelineStatus;
  status: LeadStatus;
  internalNotes: string;
  assignee: string;
  priority: LeadPriority;
  tags: string[];
  followUpDate: string | null;
  reminderEnabled: boolean;
  reminderSentAt: string | null;
  activityHistory: LeadActivityEntry[];
  documents: LeadDocument[];
  notificationHistory: LeadNotificationEntry[];
}

const PIPELINE_OPTIONS: Array<{ value: PipelineStatus; label: string; description: string; badgeClass: string; columnClass: string }> = [
  {
    value: "new",
    label: "New",
    description: "Fresh intake requests waiting for first touch.",
    badgeClass: "bg-slate-100 text-slate-700",
    columnClass: "border-slate-200 bg-slate-50",
  },
  {
    value: "contacted",
    label: "Contacted",
    description: "Client reached by call, email, or WhatsApp.",
    badgeClass: "bg-sky-100 text-sky-700",
    columnClass: "border-sky-200 bg-sky-50",
  },
  {
    value: "searching",
    label: "Searching",
    description: "Operations team is sourcing land options.",
    badgeClass: "bg-amber-100 text-amber-700",
    columnClass: "border-amber-200 bg-amber-50",
  },
  {
    value: "matched",
    label: "Matched",
    description: "A viable landowner file has been found.",
    badgeClass: "bg-emerald-100 text-emerald-700",
    columnClass: "border-emerald-200 bg-emerald-50",
  },
  {
    value: "closed",
    label: "Closed",
    description: "Request completed, won, lost, or archived.",
    badgeClass: "bg-zinc-200 text-zinc-700",
    columnClass: "border-zinc-200 bg-zinc-50",
  },
];

const PRIORITY_OPTIONS: Array<{ value: LeadPriority; label: string }> = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

const TAG_OPTIONS = ["Agriculture", "Storage", "Events", "Industrial", "Renewable", "Construction", "Research", "Logistics", "Hot lead", "High budget"];
const STAFF_OPTIONS = ["Amina", "Kelechi", "Tunde", "Nneka", "Seyi"];
const CALL_OUTCOMES = ["Reached client", "Left voicemail", "No answer", "Needs callback", "Qualified request", "Not a fit"];
const MAX_DOCUMENT_SIZE = 4 * 1024 * 1024;

function formatDate(value?: string | null) {
  if (!value) return "Not scheduled";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not scheduled";

  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatShortDate(value?: string | null) {
  if (!value) return "No date";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "No date";

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function formatFileSize(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function normalizeDateOnly(value?: string | null) {
  if (!value) return null;
  return value.includes("T") ? value.split("T")[0] : value;
}

function isFollowUpOverdue(lead: AdminLead) {
  if (!lead.reminderEnabled || !lead.followUpDate || lead.contactStatus === "closed") return false;
  const dueDate = new Date(`${normalizeDateOnly(lead.followUpDate)}T23:59:59`);
  return dueDate.getTime() < Date.now();
}

function isFollowUpDueToday(lead: AdminLead) {
  if (!lead.reminderEnabled || !lead.followUpDate || lead.contactStatus === "closed") return false;
  const dueDate = new Date(`${normalizeDateOnly(lead.followUpDate)}T00:00:00`);
  return dueDate.toDateString() === new Date().toDateString();
}

function daysSince(value?: string | null) {
  if (!value) return 0;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 0;
  return Math.max(0, Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24)));
}

function getPipelineOption(status: PipelineStatus) {
  return PIPELINE_OPTIONS.find((option) => option.value === status) || PIPELINE_OPTIONS[0];
}

function getNextPipelineStatus(status: PipelineStatus) {
  const currentIndex = PIPELINE_OPTIONS.findIndex((option) => option.value === status);
  return PIPELINE_OPTIONS[Math.min(currentIndex + 1, PIPELINE_OPTIONS.length - 1)]?.value || status;
}

function mapPipelineToInternalStatus(status: PipelineStatus): LeadStatus {
  if (status === "closed") return "closed";
  if (status === "matched") return "qualified";
  if (status === "new") return "new";
  return "follow-up";
}

function cleanPhoneNumber(value: string) {
  return value.replace(/[^0-9]/g, "");
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export default function AdminDashboard() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("fieldlease_admin_token"));
  const [username, setUsername] = useState<string | null>(() => localStorage.getItem("fieldlease_admin_user"));
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [leads, setLeads] = useState<AdminLead[]>([]);
  const [activeView, setActiveView] = useState<DashboardView>("pipeline");
  const [searchTerm, setSearchTerm] = useState("");
  const [pipelineFilter, setPipelineFilter] = useState<"all" | PipelineStatus>("all");
  const [assigneeFilter, setAssigneeFilter] = useState("all");
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [assigneeDraft, setAssigneeDraft] = useState("");
  const [priorityDraft, setPriorityDraft] = useState<LeadPriority>("medium");
  const [tagsDraft, setTagsDraft] = useState<string[]>([]);
  const [followUpDateDraft, setFollowUpDateDraft] = useState("");
  const [reminderEnabledDraft, setReminderEnabledDraft] = useState(false);
  const [activityTypeDraft, setActivityTypeDraft] = useState<ActivityType>("note");
  const [activityMessageDraft, setActivityMessageDraft] = useState("");
  const [callOutcomeDraft, setCallOutcomeDraft] = useState(CALL_OUTCOMES[0]);
  const [callDurationDraft, setCallDurationDraft] = useState("");
  const [callNotesDraft, setCallNotesDraft] = useState("");
  const [emailSubjectDraft, setEmailSubjectDraft] = useState("");
  const [emailMessageDraft, setEmailMessageDraft] = useState("");
  const [whatsappMessageDraft, setWhatsappMessageDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

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
        throw new Error(errorData.error || "We couldn't load the lead list right now. Please refresh and try again.");
      }

      const data = await response.json();
      setLeads(data.leads || []);
      if (data.leads?.length) {
        setSelectedLeadId((current) => current || data.leads[0].id);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "We couldn't load the lead list right now. Please refresh and try again.";
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
      const matchesPipeline = pipelineFilter === "all" || lead.contactStatus === pipelineFilter;
      const matchesAssignee = assigneeFilter === "all" || (assigneeFilter === "unassigned" ? !lead.assignee : lead.assignee === assigneeFilter);
      if (!matchesPipeline || !matchesAssignee) return false;

      if (!query) return true;

      return [
        lead.fullName,
        lead.email,
        lead.phone,
        lead.whatsapp,
        lead.companyName,
        lead.landType,
        lead.intendedUse,
        lead.preferredState,
        lead.preferredLga,
        lead.additionalRequirements,
        lead.assignee,
        ...(lead.tags || []),
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));
    });
  }, [assigneeFilter, leads, pipelineFilter, searchTerm]);

  const selectedLead = leads.find((lead) => lead.id === selectedLeadId) || filteredLeads[0] || null;

  const summary = useMemo(() => {
    const total = leads.length;
    const closed = leads.filter((lead) => lead.contactStatus === "closed").length;
    const matched = leads.filter((lead) => lead.contactStatus === "matched").length;
    const searching = leads.filter((lead) => lead.contactStatus === "searching").length;
    const overdue = leads.filter(isFollowUpOverdue).length;
    const dueToday = leads.filter(isFollowUpDueToday).length;
    const unassigned = leads.filter((lead) => !lead.assignee).length;
    const conversionRate = total ? Math.round(((matched + closed) / total) * 100) : 0;

    return { total, closed, matched, searching, overdue, dueToday, unassigned, conversionRate };
  }, [leads]);

  const analytics = useMemo(() => {
    const countByAssignee = STAFF_OPTIONS.map((staff) => ({
      label: staff,
      value: leads.filter((lead) => lead.assignee === staff).length,
    })).filter((item) => item.value > 0);

    const countByPriority = PRIORITY_OPTIONS.map((priority) => ({
      label: priority.label,
      value: leads.filter((lead) => lead.priority === priority.value).length,
    }));

    const tagCounts = TAG_OPTIONS.map((tag) => ({
      label: tag,
      value: leads.filter((lead) => lead.tags?.includes(tag)).length,
    })).filter((item) => item.value > 0);

    const totalActivities = leads.reduce((count, lead) => count + (lead.activityHistory?.length || 0), 0);
    const totalDocuments = leads.reduce((count, lead) => count + (lead.documents?.length || 0), 0);
    const totalNotifications = leads.reduce((count, lead) => count + (lead.notificationHistory?.length || 0), 0);
    const averageAge = leads.length ? Math.round(leads.reduce((sum, lead) => sum + daysSince(lead.submittedAt), 0) / leads.length) : 0;

    return { countByAssignee, countByPriority, tagCounts, totalActivities, totalDocuments, totalNotifications, averageAge };
  }, [leads]);

  useEffect(() => {
    if (!selectedLead) return;

    setNoteDraft(selectedLead.internalNotes || "");
    setAssigneeDraft(selectedLead.assignee || "");
    setPriorityDraft(selectedLead.priority || "medium");
    setTagsDraft(selectedLead.tags || []);
    setFollowUpDateDraft(normalizeDateOnly(selectedLead.followUpDate) || "");
    setReminderEnabledDraft(Boolean(selectedLead.reminderEnabled));
    setActivityTypeDraft("note");
    setActivityMessageDraft("");
    setCallOutcomeDraft(CALL_OUTCOMES[0]);
    setCallDurationDraft("");
    setCallNotesDraft("");

    const firstName = selectedLead.fullName.split(" ")[0] || "there";
    setEmailSubjectDraft(`FieldLease update: ${selectedLead.preferredState || "land"} request`);
    setEmailMessageDraft(`Hi ${firstName},\n\nThis is a quick FieldLease update on your land request. Our operations team is reviewing options that match your ${selectedLead.minSize || "requested"} requirement in ${selectedLead.preferredState || "your preferred area"}.\n\nWe will share the next viable landowner file as soon as it is ready.\n\nBest,\nFieldLease Operations`);
    setWhatsappMessageDraft(`Hi ${firstName}, this is FieldLease. We have an update on your temporary land request for ${selectedLead.preferredState || "your preferred area"}. Can we share the next steps here?`);
  }, [selectedLead?.id]);

  const handleLogin = async (event: FormEvent) => {
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
        throw new Error(data.error || "We couldn't update this lead right now. Please try again.");
      }

      setLeads((current) => current.map((lead) => (lead.id === leadId ? data.lead : lead)));
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : "We couldn't update this lead right now. Please try again.";
      setFeedbackMessage(message);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const createActivityEntry = (lead: AdminLead, type: ActivityType, message: string): LeadActivityEntry => ({
    id: `${lead.id}-${type}-${Date.now()}`,
    type,
    message,
    createdAt: new Date().toISOString(),
    actor: username || "Admin",
  });

  const createNotificationEntry = (lead: AdminLead, channel: "email" | "whatsapp", recipient: string, message: string, subject?: string): LeadNotificationEntry => ({
    id: `${lead.id}-${channel}-${Date.now()}`,
    channel,
    recipient,
    subject,
    message,
    status: channel === "email" ? "composer-opened" : "whatsapp-opened",
    sentAt: new Date().toISOString(),
    actor: username || "Admin",
  });

  const updateLeadWithActivity = async (lead: AdminLead, patch: Partial<AdminLead>, type: ActivityType, message: string) => {
    const entry = createActivityEntry(lead, type, message);
    return updateLead(lead.id, {
      ...patch,
      activityHistory: [entry, ...(lead.activityHistory || [])],
    });
  };

  const handleSaveWorkflow = async () => {
    if (!selectedLead) return;

    const changes = [];
    if ((selectedLead.assignee || "") !== assigneeDraft) changes.push(`assignee set to ${assigneeDraft || "Unassigned"}`);
    if (selectedLead.priority !== priorityDraft) changes.push(`priority set to ${priorityDraft}`);
    if ((normalizeDateOnly(selectedLead.followUpDate) || "") !== followUpDateDraft) changes.push(`follow-up set to ${followUpDateDraft || "none"}`);
    if (Boolean(selectedLead.reminderEnabled) !== reminderEnabledDraft) changes.push(`reminder ${reminderEnabledDraft ? "enabled" : "disabled"}`);
    if ((selectedLead.tags || []).join("|") !== tagsDraft.join("|")) changes.push("tags updated");
    if ((selectedLead.internalNotes || "") !== noteDraft) changes.push("notes updated");

    const patch: Partial<AdminLead> = {
      internalNotes: noteDraft,
      assignee: assigneeDraft,
      priority: priorityDraft,
      tags: tagsDraft,
      followUpDate: followUpDateDraft || null,
      reminderEnabled: reminderEnabledDraft,
    };

    if (changes.length) {
      patch.activityHistory = [
        createActivityEntry(selectedLead, assigneeDraft !== selectedLead.assignee ? "assignment" : "note", `Workflow updated: ${changes.join(", ")}.`),
        ...(selectedLead.activityHistory || []),
      ];
    }

    const saved = await updateLead(selectedLead.id, patch);

    if (saved) {
      setFeedbackMessage("Workflow details saved successfully.");
    }
  };

  const handlePipelineChange = async (lead: AdminLead, nextStatus: PipelineStatus) => {
    if (lead.contactStatus === nextStatus) return;

    const saved = await updateLeadWithActivity(
      lead,
      {
        contactStatus: nextStatus,
        status: mapPipelineToInternalStatus(nextStatus),
      },
      "status-change",
      `Pipeline moved from ${getPipelineOption(lead.contactStatus).label} to ${getPipelineOption(nextStatus).label}.`
    );

    if (saved) {
      setFeedbackMessage(`Lead moved to ${getPipelineOption(nextStatus).label}.`);
    }
  };

  const handleAddActivity = async () => {
    if (!selectedLead || !activityMessageDraft.trim()) return;

    const saved = await updateLeadWithActivity(selectedLead, {}, activityTypeDraft, activityMessageDraft.trim());

    if (saved) {
      setFeedbackMessage("Activity added to the lead history.");
      setActivityMessageDraft("");
    }
  };

  const handleLogCall = async () => {
    if (!selectedLead) return;

    const detail = callNotesDraft.trim() ? ` Notes: ${callNotesDraft.trim()}` : "";
    const duration = callDurationDraft.trim() ? ` (${callDurationDraft.trim()} min)` : "";
    const message = `Call logged: ${callOutcomeDraft}${duration}.${detail}`;
    const patch: Partial<AdminLead> = {};

    if (selectedLead.contactStatus === "new") {
      patch.contactStatus = "contacted";
      patch.status = "follow-up";
    }

    const saved = await updateLeadWithActivity(selectedLead, patch, "call", message);

    if (saved) {
      setFeedbackMessage("Call history updated.");
      setCallOutcomeDraft(CALL_OUTCOMES[0]);
      setCallDurationDraft("");
      setCallNotesDraft("");
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
      window.alert(`Reminder recorded for ${selectedLead.fullName}`);
    }

    const saved = await updateLeadWithActivity(
      selectedLead,
      { reminderSentAt: new Date().toISOString() },
      "reminder",
      `Follow-up reminder recorded for ${selectedLead.fullName}.`
    );

    if (saved) {
      setFeedbackMessage("Reminder recorded for the selected lead.");
    }
  };

  const handleDocumentUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    if (!selectedLead) return;

    const files = Array.from(event.target.files || []);
    event.target.value = "";
    if (!files.length) return;

    const oversizedFile = files.find((file) => file.size > MAX_DOCUMENT_SIZE);
    if (oversizedFile) {
      setFeedbackMessage(`${oversizedFile.name} is too large. Keep each document under 4 MB.`);
      return;
    }

    try {
      setUploading(true);
      const uploadedDocuments = await Promise.all(
        files.map(async (file) => ({
          id: `${selectedLead.id}-doc-${Date.now()}-${file.name}`,
          name: file.name,
          type: file.type || "application/octet-stream",
          size: file.size,
          uploadedAt: new Date().toISOString(),
          uploadedBy: username || "Admin",
          dataUrl: await readFileAsDataUrl(file),
        }))
      );

      const saved = await updateLeadWithActivity(
        selectedLead,
        { documents: [...uploadedDocuments, ...(selectedLead.documents || [])] },
        "document",
        `${uploadedDocuments.length} document${uploadedDocuments.length === 1 ? "" : "s"} uploaded.`
      );

      if (saved) {
        setFeedbackMessage("Documents uploaded to this lead.");
      }
    } catch (error) {
      setFeedbackMessage("We couldn't upload that document. Please try a smaller file.");
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveDocument = async (documentId: string) => {
    if (!selectedLead) return;

    const document = selectedLead.documents?.find((item) => item.id === documentId);
    const saved = await updateLeadWithActivity(
      selectedLead,
      { documents: (selectedLead.documents || []).filter((item) => item.id !== documentId) },
      "document",
      `Document removed: ${document?.name || "unknown file"}.`
    );

    if (saved) {
      setFeedbackMessage("Document removed from the lead.");
    }
  };

  const handleEmailNotification = async () => {
    if (!selectedLead || !emailMessageDraft.trim()) return;

    const notification = createNotificationEntry(selectedLead, "email", selectedLead.email, emailMessageDraft.trim(), emailSubjectDraft.trim());
    const activity = createActivityEntry(selectedLead, "email", `Email notification prepared for ${selectedLead.email}: ${emailSubjectDraft || "No subject"}.`);
    const saved = await updateLead(selectedLead.id, {
      notificationHistory: [notification, ...(selectedLead.notificationHistory || [])],
      activityHistory: [activity, ...(selectedLead.activityHistory || [])],
    });

    if (saved && typeof window !== "undefined") {
      const mailto = `mailto:${selectedLead.email}?subject=${encodeURIComponent(emailSubjectDraft)}&body=${encodeURIComponent(emailMessageDraft)}`;
      window.location.href = mailto;
      setFeedbackMessage("Email notification logged and composer opened.");
    }
  };

  const handleWhatsappNotification = async () => {
    if (!selectedLead || !whatsappMessageDraft.trim()) return;

    const recipient = selectedLead.whatsapp || selectedLead.phone;
    const cleanRecipient = cleanPhoneNumber(recipient);
    if (!cleanRecipient) {
      setFeedbackMessage("This lead does not have a valid WhatsApp number.");
      return;
    }

    if (typeof window !== "undefined") {
      window.open(`https://wa.me/${cleanRecipient}?text=${encodeURIComponent(whatsappMessageDraft)}`, "_blank", "noopener,noreferrer");
    }

    const notification = createNotificationEntry(selectedLead, "whatsapp", recipient, whatsappMessageDraft.trim());
    const activity = createActivityEntry(selectedLead, "whatsapp", `WhatsApp message opened for ${recipient}.`);
    const saved = await updateLead(selectedLead.id, {
      notificationHistory: [notification, ...(selectedLead.notificationHistory || [])],
      activityHistory: [activity, ...(selectedLead.activityHistory || [])],
      contactStatus: selectedLead.contactStatus === "new" ? "contacted" : selectedLead.contactStatus,
      status: selectedLead.contactStatus === "new" ? "follow-up" : selectedLead.status,
    });

    if (saved) {
      setFeedbackMessage("WhatsApp outreach logged.");
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
      lead.whatsapp || "",
      lead.companyName || "",
      getPipelineOption(lead.contactStatus).label,
      lead.landType,
      lead.intendedUse,
      lead.preferredState,
      lead.preferredLga,
      lead.priority,
      lead.assignee || "Unassigned",
      lead.tags.join(", "),
      lead.followUpDate || "",
      lead.reminderEnabled ? "Yes" : "No",
      (lead.documents || []).length,
      (lead.notificationHistory || []).length,
      lead.internalNotes.replace(/\n/g, " "),
      lead.submittedAt,
    ]);

    const csvHeader = [
      "Name",
      "Email",
      "Phone",
      "WhatsApp",
      "Company",
      "Pipeline",
      "Land Type",
      "Intended Use",
      "State",
      "LGA",
      "Priority",
      "Assigned To",
      "Tags",
      "Follow-up Date",
      "Reminder Enabled",
      "Documents",
      "Notifications",
      "Notes",
      "Submitted At",
    ];

    const csvContent = [csvHeader, ...rows]
      .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "fieldlease-crm-leads.csv";
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const renderLeadCard = (lead: AdminLead, compact = false) => {
    const pipeline = getPipelineOption(lead.contactStatus);
    const nextStatus = getNextPipelineStatus(lead.contactStatus);

    return (
      <button
        key={lead.id}
        onClick={() => {
          setSelectedLeadId(lead.id);
          setActiveView("desk");
        }}
        className={`w-full rounded-2xl border p-4 text-left transition ${
          selectedLead?.id === lead.id ? "border-emerald-500 bg-emerald-50/70" : "border-slate-200 bg-white hover:border-slate-300"
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-semibold text-slate-900">{lead.fullName}</p>
            <p className="mt-1 text-sm text-slate-500">{lead.intendedUse}</p>
          </div>
          <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${pipeline.badgeClass}`}>{pipeline.label}</span>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-600">{lead.preferredState || "No state"}</span>
          <span className="rounded-full bg-amber-100 px-2.5 py-1 font-medium text-amber-700">{lead.priority}</span>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-600">{lead.assignee || "Unassigned"}</span>
          {isFollowUpOverdue(lead) ? <span className="rounded-full bg-rose-100 px-2.5 py-1 font-medium text-rose-700">Overdue</span> : null}
          {isFollowUpDueToday(lead) ? <span className="rounded-full bg-orange-100 px-2.5 py-1 font-medium text-orange-700">Due today</span> : null}
        </div>
        {!compact ? (
          <div className="mt-3 flex items-center justify-between gap-3 border-t border-slate-100 pt-3 text-xs text-slate-500">
            <span>{formatShortDate(lead.submittedAt)} intake</span>
            {nextStatus !== lead.contactStatus ? (
              <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                Move to {getPipelineOption(nextStatus).label}
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            ) : (
              <span>Complete</span>
            )}
          </div>
        ) : null}
      </button>
    );
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
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-400">FieldLease CRM</p>
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
        <header className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-600">FieldLease Operations CRM</p>
            <h1 className="mt-1 text-3xl font-bold text-slate-900">Lead pipeline command center</h1>
            <p className="mt-2 text-sm text-slate-500">Assign requests, track calls, manage documents, send updates, and measure sourcing performance.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              <div className="flex items-center gap-2 font-semibold text-slate-900">
                <UserCircle className="h-4 w-4 text-emerald-600" />
                {username || "Admin"}
              </div>
            </div>
            <button
              onClick={() => void fetchLeads()}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <Sparkles className="h-4 w-4" />
              Refresh
            </button>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
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

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          {[
            { label: "Total leads", value: summary.total, icon: ClipboardList, tone: "text-slate-900" },
            { label: "Searching", value: summary.searching, icon: Search, tone: "text-amber-600" },
            { label: "Matched", value: summary.matched, icon: CheckCircle2, tone: "text-emerald-600" },
            { label: "Due today", value: summary.dueToday, icon: Clock, tone: "text-orange-600" },
            { label: "Overdue", value: summary.overdue, icon: BellRing, tone: "text-rose-600" },
            { label: "Conversion", value: `${summary.conversionRate}%`, icon: BarChart3, tone: "text-sky-600" },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm text-slate-500">{item.label}</p>
                  <Icon className={`h-4 w-4 ${item.tone}`} />
                </div>
                <p className={`mt-2 text-3xl font-bold ${item.tone}`}>{item.value}</p>
              </div>
            );
          })}
        </section>

        <section className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap gap-2">
            {[
              { value: "pipeline", label: "Pipeline", icon: LayoutDashboard },
              { value: "desk", label: "Lead desk", icon: Users },
              { value: "analytics", label: "Analytics", icon: BarChart3 },
            ].map((view) => {
              const Icon = view.icon;
              const active = activeView === view.value;
              return (
                <button
                  key={view.value}
                  onClick={() => setActiveView(view.value as DashboardView)}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                    active ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {view.label}
                </button>
              );
            })}
          </div>
          <div className="grid gap-2 md:grid-cols-[minmax(220px,1fr)_auto_auto_auto]">
            <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-600">
              <Search className="h-4 w-4" />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search leads, tags, location..."
                className="w-full bg-transparent outline-none"
              />
            </label>
            <select
              value={pipelineFilter}
              onChange={(event) => setPipelineFilter(event.target.value as "all" | PipelineStatus)}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-600 outline-none"
            >
              <option value="all">All stages</option>
              {PIPELINE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <select
              value={assigneeFilter}
              onChange={(event) => setAssigneeFilter(event.target.value)}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-600 outline-none"
            >
              <option value="all">All owners</option>
              <option value="unassigned">Unassigned</option>
              {STAFF_OPTIONS.map((staff) => (
                <option key={staff} value={staff}>
                  {staff}
                </option>
              ))}
            </select>
            <button
              onClick={exportCsv}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </section>

        {activeView === "pipeline" ? (
          <section className="grid gap-4 xl:grid-cols-5">
            {PIPELINE_OPTIONS.map((stage) => {
              const stageLeads = filteredLeads.filter((lead) => lead.contactStatus === stage.value);
              return (
                <div key={stage.value} className={`rounded-3xl border p-4 shadow-sm ${stage.columnClass}`}>
                  <div className="mb-4">
                    <div className="flex items-center justify-between gap-3">
                      <h2 className="font-bold text-slate-900">{stage.label}</h2>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${stage.badgeClass}`}>{stageLeads.length}</span>
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-slate-500">{stage.description}</p>
                  </div>
                  <div className="space-y-3">
                    {stageLeads.length ? (
                      stageLeads.map((lead) => (
                        <div key={lead.id} className="space-y-2">
                          {renderLeadCard(lead, true)}
                          {getNextPipelineStatus(lead.contactStatus) !== lead.contactStatus ? (
                            <button
                              onClick={() => void handlePipelineChange(lead, getNextPipelineStatus(lead.contactStatus))}
                              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-emerald-300 hover:text-emerald-700"
                            >
                              Move to {getPipelineOption(getNextPipelineStatus(lead.contactStatus)).label}
                            </button>
                          ) : null}
                        </div>
                      ))
                    ) : (
                      <div className="rounded-2xl border border-dashed border-slate-200 bg-white/70 p-5 text-center text-sm text-slate-500">
                        No leads here.
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </section>
        ) : null}

        {activeView === "analytics" ? (
          <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-emerald-600" />
                <h2 className="text-xl font-bold text-slate-900">Pipeline analytics</h2>
              </div>
              <div className="mt-5 space-y-4">
                {PIPELINE_OPTIONS.map((stage) => {
                  const count = leads.filter((lead) => lead.contactStatus === stage.value).length;
                  const percentage = leads.length ? Math.round((count / leads.length) * 100) : 0;
                  return (
                    <div key={stage.value}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span className="font-semibold text-slate-700">{stage.label}</span>
                        <span className="text-slate-500">{count} leads</span>
                      </div>
                      <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                        <div className="h-full rounded-full bg-emerald-600" style={{ width: `${percentage}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Average lead age</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">{analytics.averageAge} days</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Unassigned queue</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">{summary.unassigned}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Documents stored</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">{analytics.totalDocuments}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Notifications logged</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">{analytics.totalNotifications}</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-emerald-600" />
                  <h2 className="text-xl font-bold text-slate-900">Assignment workload</h2>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {[...analytics.countByAssignee, { label: "Unassigned", value: summary.unassigned }].map((item) => (
                    <div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                      <p className="mt-1 text-2xl font-bold text-emerald-600">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2">
                  <Tag className="h-5 w-5 text-emerald-600" />
                  <h2 className="text-xl font-bold text-slate-900">Priority and tags</h2>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {analytics.countByPriority.map((item) => (
                    <div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                      <p className="mt-1 text-2xl font-bold text-slate-900">{item.value}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {analytics.tagCounts.length ? (
                    analytics.tagCounts.map((item) => (
                      <span key={item.label} className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
                        {item.label}: {item.value}
                      </span>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">No tagged leads yet.</p>
                  )}
                </div>
              </div>
            </div>
          </section>
        ) : null}

        {activeView === "desk" ? (
          <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4">
                <h2 className="text-xl font-bold text-slate-900">Lead queue</h2>
                <p className="text-sm text-slate-500">Search, filter, and open requests for operations work.</p>
              </div>
              {loading ? (
                <p className="text-sm text-slate-500">Loading leads...</p>
              ) : filteredLeads.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
                  No leads match this filter yet.
                </div>
              ) : (
                <div className="space-y-3">{filteredLeads.map((lead) => renderLeadCard(lead))}</div>
              )}
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              {selectedLead ? (
                <div className="space-y-5">
                  <div className="flex flex-col gap-3 border-b border-slate-100 pb-5 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-600">Lead details</p>
                      <h2 className="mt-1 text-2xl font-bold text-slate-900">{selectedLead.fullName}</h2>
                      <p className="mt-1 text-sm text-slate-500">Submitted {formatDate(selectedLead.submittedAt)}</p>
                    </div>
                    <label className="min-w-48 text-sm">
                      <span className="mb-2 block font-semibold text-slate-700">Pipeline</span>
                      <select
                        value={selectedLead.contactStatus}
                        onChange={(event) => void handlePipelineChange(selectedLead, event.target.value as PipelineStatus)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none"
                      >
                        {PIPELINE_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Email</p>
                      <p className="mt-1 break-words text-sm font-semibold text-slate-900">{selectedLead.email}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Phone / WhatsApp</p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">{selectedLead.phone}</p>
                      {selectedLead.whatsapp ? <p className="text-xs text-slate-500">WA: {selectedLead.whatsapp}</p> : null}
                    </div>
                  </div>

                  <div className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                    <p><span className="font-semibold text-slate-900">Company:</span> {selectedLead.companyName || "Not provided"}</p>
                    <p><span className="font-semibold text-slate-900">Land type:</span> {selectedLead.landType}</p>
                    <p><span className="font-semibold text-slate-900">Use case:</span> {selectedLead.intendedUse}</p>
                    <p><span className="font-semibold text-slate-900">Location:</span> {selectedLead.preferredState}, {selectedLead.preferredLga}</p>
                    <p><span className="font-semibold text-slate-900">Size:</span> {selectedLead.minSize || "Not provided"}</p>
                    <p><span className="font-semibold text-slate-900">Budget:</span> {selectedLead.maxBudget || "Not provided"}</p>
                    <p><span className="font-semibold text-slate-900">Lease duration:</span> {selectedLead.leaseDuration || "Not provided"}</p>
                    <p><span className="font-semibold text-slate-900">Extra requirements:</span> {selectedLead.additionalRequirements || "None"}</p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center gap-2 font-semibold text-slate-900">
                      <CalendarDays className="h-4 w-4 text-emerald-600" />
                      Assignment, follow-up, and tags
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
                      <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                        <Tag className="h-4 w-4 text-emerald-600" />
                        Internal tags
                      </p>
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

                    <label className="mt-4 block text-sm">
                      <span className="mb-2 block font-semibold text-slate-700">Internal notes</span>
                      <textarea
                        value={noteDraft}
                        onChange={(event) => setNoteDraft(event.target.value)}
                        rows={5}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none"
                        placeholder="Add call notes, sourcing constraints, landowner preferences, or next steps..."
                      />
                    </label>

                    <button
                      onClick={() => void handleSaveWorkflow()}
                      disabled={saving}
                      className="mt-4 w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {saving ? "Saving..." : "Save workflow"}
                    </button>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                    <div className="flex items-center gap-2 font-semibold text-slate-900">
                      <BellRing className="h-4 w-4 text-emerald-600" />
                      Follow-up reminders
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-white px-3 py-1 font-medium text-slate-600">{selectedLead.followUpDate ? formatDate(selectedLead.followUpDate) : "No follow-up date"}</span>
                      {selectedLead.reminderEnabled ? <span className="rounded-full bg-emerald-100 px-3 py-1 font-medium text-emerald-700">Reminder enabled</span> : null}
                      {selectedLead.reminderSentAt ? <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-600">Last sent {formatShortDate(selectedLead.reminderSentAt)}</span> : null}
                    </div>
                    {selectedLead.reminderEnabled && selectedLead.followUpDate ? (
                      <button
                        onClick={() => void handleReminder()}
                        className="mt-3 inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-2 text-sm font-semibold text-white"
                      >
                        <BellRing className="h-4 w-4" />
                        Record reminder
                      </button>
                    ) : null}
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                    <div className="flex items-center gap-2 font-semibold text-slate-900">
                      <Phone className="h-4 w-4 text-emerald-600" />
                      Call history
                    </div>
                    <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_120px]">
                      <select
                        value={callOutcomeDraft}
                        onChange={(event) => setCallOutcomeDraft(event.target.value)}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none"
                      >
                        {CALL_OUTCOMES.map((outcome) => (
                          <option key={outcome} value={outcome}>
                            {outcome}
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        min="0"
                        value={callDurationDraft}
                        onChange={(event) => setCallDurationDraft(event.target.value)}
                        placeholder="Minutes"
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none"
                      />
                    </div>
                    <textarea
                      value={callNotesDraft}
                      onChange={(event) => setCallNotesDraft(event.target.value)}
                      rows={3}
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none"
                      placeholder="Call outcome, objections, decision maker, or next step..."
                    />
                    <div className="mt-3 flex flex-wrap gap-2">
                      <a href={`tel:${selectedLead.phone}`} className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm">
                        <Phone className="h-4 w-4 text-emerald-600" />
                        Call
                      </a>
                      <button
                        onClick={() => void handleLogCall()}
                        className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-2 text-sm font-semibold text-white"
                      >
                        <Phone className="h-4 w-4" />
                        Log call
                      </button>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 font-semibold text-slate-900">
                        <FileUp className="h-4 w-4 text-emerald-600" />
                        Documents
                      </div>
                      <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-slate-900 px-3 py-2 text-sm font-semibold text-white">
                        <FileUp className="h-4 w-4" />
                        {uploading ? "Uploading..." : "Upload"}
                        <input type="file" multiple className="hidden" onChange={(event) => void handleDocumentUpload(event)} disabled={uploading} />
                      </label>
                    </div>
                    <div className="mt-3 space-y-2">
                      {(selectedLead.documents || []).length ? (
                        selectedLead.documents.map((document) => (
                          <div key={document.id} className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <p className="font-semibold text-slate-900">{document.name}</p>
                              <p className="text-xs text-slate-500">{formatFileSize(document.size)} uploaded {formatShortDate(document.uploadedAt)}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              {document.dataUrl ? (
                                <a href={document.dataUrl} download={document.name} className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700">
                                  <Download className="h-3.5 w-3.5" />
                                  Download
                                </a>
                              ) : null}
                              <button
                                onClick={() => void handleRemoveDocument(document.id)}
                                className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                Remove
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="rounded-xl border border-dashed border-slate-200 bg-white p-4 text-center text-sm text-slate-500">No documents uploaded yet.</p>
                      )}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                    <div className="flex items-center gap-2 font-semibold text-slate-900">
                      <Send className="h-4 w-4 text-emerald-600" />
                      Email and WhatsApp notifications
                    </div>
                    <div className="mt-3 grid gap-4 lg:grid-cols-2">
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-slate-700">Email subject</label>
                        <input
                          value={emailSubjectDraft}
                          onChange={(event) => setEmailSubjectDraft(event.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none"
                        />
                        <textarea
                          value={emailMessageDraft}
                          onChange={(event) => setEmailMessageDraft(event.target.value)}
                          rows={6}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none"
                        />
                        <button
                          onClick={() => void handleEmailNotification()}
                          className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-2 text-sm font-semibold text-white"
                        >
                          <Mail className="h-4 w-4" />
                          Log and open email
                        </button>
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-slate-700">WhatsApp message</label>
                        <textarea
                          value={whatsappMessageDraft}
                          onChange={(event) => setWhatsappMessageDraft(event.target.value)}
                          rows={8}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none"
                        />
                        <button
                          onClick={() => void handleWhatsappNotification()}
                          className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-3 py-2 text-sm font-semibold text-white"
                        >
                          <MessageSquare className="h-4 w-4" />
                          Send WhatsApp
                        </button>
                      </div>
                    </div>
                    <div className="mt-4 space-y-2">
                      {(selectedLead.notificationHistory || []).slice(0, 4).map((entry) => (
                        <div key={entry.id} className="rounded-xl border border-slate-200 bg-white p-3">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-semibold text-slate-900">{entry.channel.toUpperCase()} to {entry.recipient}</p>
                            <span className="text-xs text-slate-500">{formatShortDate(entry.sentAt)}</span>
                          </div>
                          <p className="mt-1 line-clamp-2 text-xs text-slate-500">{entry.subject ? `${entry.subject}: ` : ""}{entry.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                    <div className="flex items-center gap-2 font-semibold text-slate-900">
                      <MessageSquare className="h-4 w-4 text-emerald-600" />
                      Activity timeline
                    </div>
                    <div className="mt-3 space-y-2">
                      {(selectedLead.activityHistory || []).slice(0, 8).map((entry) => (
                        <div key={entry.id} className="rounded-xl border border-slate-200 bg-white p-3">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-semibold text-slate-900">{entry.message}</p>
                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.2em] text-slate-600">{entry.type}</span>
                          </div>
                          <p className="mt-1 text-xs text-slate-500">{formatDate(entry.createdAt)}{entry.actor ? ` by ${entry.actor}` : ""}</p>
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
                          <option value="note">Note</option>
                          <option value="call">Call</option>
                          <option value="whatsapp">WhatsApp</option>
                          <option value="email">Email</option>
                          <option value="status-change">Status change</option>
                          <option value="reminder">Reminder</option>
                          <option value="document">Document</option>
                          <option value="system">System</option>
                        </select>
                        <textarea
                          value={activityMessageDraft}
                          onChange={(event) => setActivityMessageDraft(event.target.value)}
                          rows={3}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none"
                          placeholder="Capture sourcing progress, owner feedback, permit questions, or next step..."
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
                </div>
              ) : (
                <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
                  Select a lead to review notes and update status.
                </div>
              )}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
