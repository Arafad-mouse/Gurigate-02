import { useState, useEffect, useContext } from "react";
import { supabase } from "@/lib/supabase";
import { AuthContext } from "@/lib/auth-context";
import type { ReactElement } from "react";
import { Plus, Search, Trash2, Edit2, X, Loader2, AlertCircle, TrendingDown, Wallet, Receipt, Tag } from "lucide-react";
import {
  getExpenseData, createExpense, updateExpense, deleteExpense,
  type Expense, type ExpenseCategory, type ExpenseStatus,
  type ExpenseSummary, type ExpenseStatusCounts, type CategoryTotal,
} from "@/services/expenseService";

const CL: Record<ExpenseCategory, string> = {
  maintenance: "Maintenance", utilities: "Utilities", salaries: "Salaries", supplies: "Supplies",
  marketing: "Marketing", insurance: "Insurance", taxes: "Taxes", mortgage: "Mortgage", other: "Other",
};
const CC: Record<ExpenseCategory, string> = {
  maintenance: "#3B82F6", utilities: "#F59E0B", salaries: "#8B5CF6", supplies: "#10B981",
  marketing: "#EC4899", insurance: "#06B6D4", taxes: "#EF4444", mortgage: "#6366F1", other: "#6B7280",
};
const SS: Record<ExpenseStatus, { bg: string; color: string }> = {
  paid: { bg: "#dcfce7", color: "#15803d" }, pending: { bg: "#FFF7ED", color: "#c2410c" }, overdue: { bg: "#FEF2F2", color: "#E8344E" },
};
const BRAND = "#BA0036";
const fmt = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
const fdate = (iso: string) => new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

export default function GuriGateTransaction() {
  const authContext = useContext(AuthContext);
  const [uid, setUid] = useState<string | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [summary, setSummary] = useState<ExpenseSummary>({ total: 0, paid: 0, pending: 0, overdue: 0 });
  const [statusCounts, setStatusCounts] = useState<ExpenseStatusCounts>({ paid: 0, pending: 0, overdue: 0 });
  const [categoryTotals, setCategoryTotals] = useState<CategoryTotal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState<ExpenseCategory | "all">("all");
  const [stFilter, setStFilter] = useState<ExpenseStatus | "all">("all");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    description: "", category: "maintenance" as ExpenseCategory, amount: "",
    expense_date: new Date().toISOString().split("T")[0], payment_method: "",
    vendor: "", status: "paid" as ExpenseStatus, notes: "",
  });


  useEffect(() => {
    const sessionUserId = authContext?.session?.user?.id;
    const profileUserId = authContext?.profile?.id;
    if (profileUserId) {
      setUid(profileUserId);
    } else if (sessionUserId) {
      setUid(sessionUserId);
    } else {
      supabase.auth.getSession().then(({ data }: { data: { session: { user: { id: string } } | null } }) => {
        if (data.session?.user?.id) setUid(data.session.user.id);
      });
    }
  }, [authContext?.session?.user?.id, authContext?.profile?.id]);

  useEffect(() => { load(); }, []);


  async function load() {
    setLoading(true); setError(null);
    try {
      const data = await getExpenseData();
      setExpenses(data.expenses);
      setSummary(data.summary);
      setStatusCounts(data.statusCounts);
      setCategoryTotals(data.categoryTotals);
    } catch (e: any) { setError(e.message); } finally { setLoading(false); }
  }

  const filtered = expenses.filter(e => {
    if (catFilter !== "all" && e.category !== catFilter) return false;
    if (stFilter !== "all" && e.status !== stFilter) return false;
    if (search) { const q = search.toLowerCase(); return e.description.toLowerCase().includes(q) || (e.vendor || "").toLowerCase().includes(q); }
    return true;
  });

  const { total, paid, pending, overdue } = summary;

  function openAdd() {
    setEditing(null);
    setForm({ description: "", category: "maintenance", amount: "", expense_date: new Date().toISOString().split("T")[0], payment_method: "", vendor: "", status: "paid", notes: "" });
    setShowModal(true);
  }

  function openEdit(e: Expense) {
    setEditing(e);
    setForm({ description: e.description, category: e.category, amount: String(e.amount), expense_date: e.expense_date, payment_method: e.payment_method || "", vendor: e.vendor || "", status: e.status, notes: e.notes || "" });
    setShowModal(true);
  }

  async function save() {
    let currentUid = uid;
    if (!currentUid) {
      const { data } = await supabase.auth.getSession();
      currentUid = data.session?.user?.id ?? null;
      if (currentUid) setUid(currentUid);
    }
    console.log("[Expenses] uid:", currentUid);
    if (!currentUid) { setError("No user session found. Please log in again."); return; }
    if (!form.description.trim() || !form.amount) { setError("Description and amount are required"); return; }
    setSaving(true); setError(null);
    try {
      const payload = { owner_id: currentUid, description: form.description.trim(), category: form.category, amount: parseFloat(form.amount), expense_date: form.expense_date, payment_method: form.payment_method.trim() || null, vendor: form.vendor.trim() || null, status: form.status, notes: form.notes.trim() || null, property_id: null };
      if (editing) { await updateExpense(editing.id, payload); }
      else { await createExpense(payload); }
      setShowModal(false); await load();
    } catch (e: any) { setError(e.message || "Failed to save expense"); } finally { setSaving(false); }
  }

  async function del(id: string) {
    if (!confirm("Delete this expense?")) return;
    try { await deleteExpense(id); await load(); }
    catch (e: any) { setError(e.message); }
  }

  const cats = categoryTotals.slice(0, 5);

  return (
    <>
      <style>{`*{box-sizing:border-box;margin:0;padding:0}::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:#fca5a5;border-radius:4px}.txn-row{transition:background .1s}.txn-row:hover td{background:rgba(186,0,54,0.025)}.stat-card{background:white;border-radius:12px;padding:20px 24px;border:1px solid #E9ECF0;flex:1;min-width:220px}`}</style>
      <main style={{ padding: "28px", flex: 1, overflowY: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div><h1 style={{ fontSize: 24, fontWeight: 800, color: "#111827" }}>Expenses</h1><p style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>Track and manage property-related expenses.</p></div>
          <button onClick={openAdd} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 10, border: "none", background: BRAND, color: "white", fontSize: 13, fontWeight: 600, cursor: "pointer" }}><Plus size={16} /> Add Expense</button>
        </div>

        {error && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, padding: "12px 16px", borderRadius: 10, border: "1px solid #fecaca", background: "#fef2f2", fontSize: 13, color: "#b91c1c" }}>
            <AlertCircle size={16} /><span style={{ flex: 1 }}>{error}</span><button onClick={() => setError(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#b91c1c" }}><X size={16} /></button>
          </div>
        )}

        <div key={`summary-${total}-${paid}-${pending}-${overdue}`} style={{ display: "flex", gap: 14, marginBottom: 24, overflowX: "auto" }}>
          {[["Total Expenses", total, <TrendingDown size={18} color={BRAND} />], ["Paid", paid, <Wallet size={18} color="#10B981" />], ["Pending", pending, <Receipt size={18} color="#F59E0B" />], ["Overdue", overdue, <AlertCircle size={18} color="#EF4444" />]].map(([label, val, icon], i) => {
            const formatted = fmt(val as number);
            return (
            <div key={`${label}-${val}`} className="stat-card">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#9CA3AF" }}>{label as string}</span>{icon as ReactElement}
              </div>
              <p style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-1px", color: "#111827" }}>{formatted}</p>
            </div>
          );
          })}
        </div>

        {cats.length > 0 && cats[0].total > 0 && (
          <div style={{ background: "white", borderRadius: 12, border: "1px solid #E9ECF0", padding: 20, marginBottom: 24 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "#111827", marginBottom: 16 }}>Top Categories</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {cats.filter(c => c.total > 0).map(c => {
                const pct = total > 0 ? (c.total / total) * 100 : 0;
                return (<div key={c.category}><div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}><span style={{ fontSize: 12, fontWeight: 600, color: "#4B5563" }}>{CL[c.category]}</span><span style={{ fontSize: 12, fontWeight: 700, color: "#111827" }}>{fmt(c.total)}</span></div><div style={{ height: 6, borderRadius: 4, background: "#f1f5f9" }}><div style={{ width: `${pct}%`, height: "100%", borderRadius: 4, background: CC[c.category] }} /></div></div>);
              })}
            </div>
          </div>
        )}

        <div style={{ background: "white", borderRadius: 16, border: "1px solid #E9ECF0", overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderBottom: "1px solid #E9ECF0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#F8FAFC", border: "1.5px solid #E9ECF0", borderRadius: 8, padding: "6px 12px", width: 200 }}>
                <Search size={14} color="#9CA3AF" /><input placeholder="Search expenses…" value={search} onChange={e => setSearch(e.target.value)} style={{ border: "none", outline: "none", background: "transparent", fontSize: 12, width: "100%", fontFamily: "inherit" }} />
              </div>
              <select value={catFilter} onChange={e => setCatFilter(e.target.value as any)} style={{ appearance: "none", border: "1.5px solid #E9ECF0", borderRadius: 8, padding: "7px 28px 7px 10px", fontSize: 12, fontWeight: 600, color: "#4B5563", cursor: "pointer", background: "white", outline: "none" }}>
                <option value="all">All Categories</option>{Object.entries(CL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
              <select value={stFilter} onChange={e => setStFilter(e.target.value as any)} style={{ appearance: "none", border: "1.5px solid #E9ECF0", borderRadius: 8, padding: "7px 28px 7px 10px", fontSize: 12, fontWeight: 600, color: "#4B5563", cursor: "pointer", background: "white", outline: "none" }}>
                <option value="all">All Status</option><option value="paid">Paid</option><option value="pending">Pending</option><option value="overdue">Overdue</option>
              </select>
            </div>
            <div key={`status-${statusCounts.paid}-${statusCounts.pending}-${statusCounts.overdue}`} style={{ display: "flex", gap: 6 }}>
              {(["paid", "pending", "overdue"] as ExpenseStatus[]).map(s => {
                const cnt = statusCounts[s];
                return <span key={s} style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: SS[s].bg, color: SS[s].color }}>{cnt} {s.charAt(0).toUpperCase() + s.slice(1)}</span>;
              })}
            </div>
          </div>

          {loading ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 60 }}><Loader2 size={24} className="animate-spin" color={BRAND} /></div>
          ) : filtered.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 60, textAlign: "center" }}>
              <Receipt size={40} color="#d1d5db" style={{ marginBottom: 12 }} />
              <h3 style={{ fontSize: 16, fontWeight: 600, color: "#111827", marginBottom: 4 }}>No expenses found</h3>
              <p style={{ fontSize: 13, color: "#9CA3AF" }}>{expenses.length === 0 ? "Add your first expense to get started." : "Try adjusting your filters."}</p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead><tr style={{ borderBottom: "1.5px solid #E9ECF0" }}>
                  {["Description", "Category", "Vendor", "Date", "Amount", "Status", ""].map((l, i) => <th key={i} style={{ padding: "14px 16px", textAlign: i === 6 ? "center" : "left", fontWeight: 600, fontSize: 12, color: "#9CA3AF", whiteSpace: "nowrap" }}>{l}</th>)}
                </tr></thead>
                <tbody>
                  {filtered.map((e, idx) => (
                    <tr key={e.id} className="txn-row" style={{ borderBottom: idx < filtered.length - 1 ? "1px solid #E9ECF0" : "none" }}>
                      <td style={{ padding: "13px 16px" }}><div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: `${CC[e.category]}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Tag size={14} color={CC[e.category]} /></div>
                        <span style={{ fontWeight: 600, fontSize: 13, color: "#111827" }}>{e.description}</span>
                      </div></td>
                      <td style={{ padding: "13px 16px" }}><span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: `${CC[e.category]}15`, color: CC[e.category] }}>{CL[e.category]}</span></td>
                      <td style={{ padding: "13px 16px", color: "#4B5563", fontSize: 13 }}>{e.vendor || "—"}</td>
                      <td style={{ padding: "13px 16px", color: "#4B5563", fontSize: 13 }}>{fdate(e.expense_date)}</td>
                      <td style={{ padding: "13px 16px", fontWeight: 700, color: "#111827", fontSize: 13 }}>{fmt(Number(e.amount))}</td>
                      <td style={{ padding: "13px 16px" }}><span style={{ ...SS[e.status], display: "inline-block", padding: "4px 14px", borderRadius: 20, fontSize: 11, fontWeight: 700 }}>{e.status.charAt(0).toUpperCase() + e.status.slice(1)}</span></td>
                      <td style={{ padding: "13px 16px" }}><div style={{ display: "flex", gap: 4 }}>
                        <button onClick={() => openEdit(e)} style={{ background: "none", border: "none", cursor: "pointer", color: "#9CA3AF", padding: 4, borderRadius: 6 }} title="Edit"><Edit2 size={14} /></button>
                        <button onClick={() => del(e.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#9CA3AF", padding: 4, borderRadius: 6 }} title="Delete"><Trash2 size={14} /></button>
                      </div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {!loading && filtered.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 20px", borderTop: "1px solid #E9ECF0" }}>
              <span style={{ fontSize: 11.5, color: "#9CA3AF", fontWeight: 500 }}>{filtered.length} expense{filtered.length !== 1 ? "s" : ""} · Total: {fmt(filtered.reduce((s, e) => s + Number(e.amount), 0))}</span>
            </div>
          )}
        </div>

        {showModal && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.35)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => !saving && setShowModal(false)}>
            <div style={{ background: "white", borderRadius: 18, width: 480, maxHeight: "85vh", overflowY: "auto", boxShadow: "0 24px 60px rgba(0,0,0,.18)" }} onClick={e => e.stopPropagation()}>
              <div style={{ padding: "24px 28px 0", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: "#111827" }}>{editing ? "Edit Expense" : "Add Expense"}</h2>
                <button onClick={() => !saving && setShowModal(false)} style={{ background: "#f1f5f9", border: "none", borderRadius: 8, width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#64748b" }}><X size={14} /></button>
              </div>
              <div style={{ padding: "0 28px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
                <div><label style={{ fontSize: 12, fontWeight: 600, color: "#4B5563", marginBottom: 6, display: "block" }}>Description *</label><input type="text" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="e.g. Plumbing repair - Unit 101" style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid #E9ECF0", fontSize: 13, outline: "none", fontFamily: "inherit" }} /></div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div><label style={{ fontSize: 12, fontWeight: 600, color: "#4B5563", marginBottom: 6, display: "block" }}>Category</label><select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value as ExpenseCategory }))} style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid #E9ECF0", fontSize: 13, outline: "none", fontFamily: "inherit", background: "white" }}>{Object.entries(CL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
                  <div><label style={{ fontSize: 12, fontWeight: 600, color: "#4B5563", marginBottom: 6, display: "block" }}>Amount *</label><input type="number" step="0.01" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} placeholder="0.00" style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid #E9ECF0", fontSize: 13, outline: "none", fontFamily: "inherit" }} /></div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div><label style={{ fontSize: 12, fontWeight: 600, color: "#4B5563", marginBottom: 6, display: "block" }}>Date</label><input type="date" value={form.expense_date} onChange={e => setForm(p => ({ ...p, expense_date: e.target.value }))} style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid #E9ECF0", fontSize: 13, outline: "none", fontFamily: "inherit" }} /></div>
                  <div><label style={{ fontSize: 12, fontWeight: 600, color: "#4B5563", marginBottom: 6, display: "block" }}>Status</label><select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value as ExpenseStatus }))} style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid #E9ECF0", fontSize: 13, outline: "none", fontFamily: "inherit", background: "white" }}><option value="paid">Paid</option><option value="pending">Pending</option><option value="overdue">Overdue</option></select></div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div><label style={{ fontSize: 12, fontWeight: 600, color: "#4B5563", marginBottom: 6, display: "block" }}>Vendor</label><input type="text" value={form.vendor} onChange={e => setForm(p => ({ ...p, vendor: e.target.value }))} placeholder="e.g. Acme Plumbing" style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid #E9ECF0", fontSize: 13, outline: "none", fontFamily: "inherit" }} /></div>
                  <div><label style={{ fontSize: 12, fontWeight: 600, color: "#4B5563", marginBottom: 6, display: "block" }}>Payment Method</label><input type="text" value={form.payment_method} onChange={e => setForm(p => ({ ...p, payment_method: e.target.value }))} placeholder="e.g. Bank Transfer" style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid #E9ECF0", fontSize: 13, outline: "none", fontFamily: "inherit" }} /></div>
                </div>
                <div><label style={{ fontSize: 12, fontWeight: 600, color: "#4B5563", marginBottom: 6, display: "block" }}>Notes</label><textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Optional notes…" rows={2} style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid #E9ECF0", fontSize: 13, outline: "none", fontFamily: "inherit", resize: "vertical" }} /></div>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, paddingTop: 4 }}>
                  <button onClick={() => setShowModal(false)} disabled={saving} style={{ padding: "10px 20px", borderRadius: 10, border: "1.5px solid #E9ECF0", background: "white", fontSize: 13, fontWeight: 600, cursor: "pointer", color: "#64748b" }}>Cancel</button>
                  <button onClick={save} disabled={saving} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 10, border: "none", background: BRAND, color: "white", fontSize: 13, fontWeight: 600, cursor: "pointer", opacity: saving ? 0.5 : 1 }}>{saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}{saving ? "Saving…" : editing ? "Update" : "Add"}</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
