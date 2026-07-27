import { supabase } from '@/lib/supabase';

// ── Types ─────────────────────────────────────────────────────────────────────
export type ExpenseCategory =
  | 'maintenance' | 'utilities' | 'salaries' | 'supplies'
  | 'marketing' | 'insurance' | 'taxes' | 'mortgage' | 'other';

export type ExpenseStatus = 'paid' | 'pending' | 'overdue';

export interface Expense {
  id: string;
  owner_id: string;
  description: string;
  category: ExpenseCategory;
  amount: number;
  expense_date: string;
  payment_method: string | null;
  vendor: string | null;
  status: ExpenseStatus;
  property_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ExpenseSummary {
  total: number;
  paid: number;
  pending: number;
  overdue: number;
}

export interface ExpenseStatusCounts {
  paid: number;
  pending: number;
  overdue: number;
}

export interface CategoryTotal {
  category: ExpenseCategory;
  total: number;
}

export interface ExpenseData {
  expenses: Expense[];
  summary: ExpenseSummary;
  statusCounts: ExpenseStatusCounts;
  categoryTotals: CategoryTotal[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function normalizeStatus(status: string): ExpenseStatus {
  const lower = (status || '').toLowerCase().trim();
  if (lower === 'paid') return 'paid';
  if (lower === 'pending' || lower === 'pending payment') return 'pending';
  if (lower === 'overdue' || lower === 'over due') return 'overdue';
  return 'pending';
}

function normalizeCategory(category: string): ExpenseCategory {
  const lower = (category || 'other').toLowerCase().trim();
  const valid: ExpenseCategory[] = [
    'maintenance', 'utilities', 'salaries', 'supplies',
    'marketing', 'insurance', 'taxes', 'mortgage', 'other',
  ];
  return (valid as string[]).includes(lower) ? (lower as ExpenseCategory) : 'other';
}

function normalizeExpense(raw: any): Expense {
  return {
    ...raw,
    status: normalizeStatus(raw.status),
    category: normalizeCategory(raw.category),
    amount: Number(raw.amount) || 0,
  };
}

function computeSummary(expenses: Expense[]): ExpenseSummary {
  return {
    total: expenses.reduce((s, e) => s + e.amount, 0),
    paid: expenses.filter(e => e.status === 'paid').reduce((s, e) => s + e.amount, 0),
    pending: expenses.filter(e => e.status === 'pending').reduce((s, e) => s + e.amount, 0),
    overdue: expenses.filter(e => e.status === 'overdue').reduce((s, e) => s + e.amount, 0),
  };
}

function computeStatusCounts(expenses: Expense[]): ExpenseStatusCounts {
  return {
    paid: expenses.filter(e => e.status === 'paid').length,
    pending: expenses.filter(e => e.status === 'pending').length,
    overdue: expenses.filter(e => e.status === 'overdue').length,
  };
}

function computeCategoryTotals(expenses: Expense[]): CategoryTotal[] {
  const map: Record<string, number> = {};
  for (const e of expenses) {
    map[e.category] = (map[e.category] || 0) + e.amount;
  }
  return Object.entries(map)
    .map(([category, total]) => ({ category: category as ExpenseCategory, total }))
    .sort((a, b) => b.total - a.total);
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function getExpenseData(): Promise<ExpenseData> {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .order('expense_date', { ascending: false });

  if (error) throw error;

  const expenses = (data || []).map(normalizeExpense);

  return {
    expenses,
    summary: computeSummary(expenses),
    statusCounts: computeStatusCounts(expenses),
    categoryTotals: computeCategoryTotals(expenses),
  };
}

export async function createExpense(
  payload: Omit<Expense, 'id' | 'created_at' | 'updated_at'>
): Promise<Expense> {
  const normalized = {
    ...payload,
    status: normalizeStatus(payload.status),
    category: normalizeCategory(payload.category),
  };

  const { data, error } = await supabase
    .from('expenses')
    .insert(normalized)
    .select()
    .single();

  if (error) throw error;
  return normalizeExpense(data);
}

export async function updateExpense(
  id: string,
  payload: Partial<Expense>
): Promise<Expense> {
  const normalized: Record<string, any> = { ...payload };
  if (payload.status) normalized.status = normalizeStatus(payload.status);
  if (payload.category) normalized.category = normalizeCategory(payload.category);
  if (payload.amount != null) normalized.amount = Number(payload.amount) || 0;

  const { data, error } = await supabase
    .from('expenses')
    .update(normalized)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return normalizeExpense(data);
}

export async function deleteExpense(id: string): Promise<void> {
  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function updateExpenseStatus(id: string, status: string): Promise<Expense> {
  return updateExpense(id, { status: normalizeStatus(status) });
}

// ── Dashboard-compatible format ───────────────────────────────────────────────
export interface DashboardExpense {
  id: string;
  description: string;
  category: string;
  recordType: string;
  amount: string;
  vendor: string;
  avatar: string;
  color: string;
  date: string;
  status: string;
}

const EXPENSE_COLORS = ['#E8344E', '#10B981', '#F59E0B', '#3B82F6', '#8B5CF6', '#EC4899'];

export async function getDashboardExpenses(limit: number = 10): Promise<DashboardExpense[]> {
  const { data, error } = await supabase
    .from('expenses')
    .select('id, description, category, amount, vendor, expense_date, status')
    .order('expense_date', { ascending: false })
    .limit(limit);

  if (error) throw error;

  return (data || []).map((e: any, index: number) => {
    const status = normalizeStatus(e.status);
    return {
      id: e.id,
      description: e.description || 'Unknown',
      category: (e.category || 'other').charAt(0).toUpperCase() + (e.category || 'other').slice(1),
      recordType: 'Expense',
      amount: `$${Number(e.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      vendor: e.vendor || 'Unknown',
      avatar: (e.vendor || 'UN').substring(0, 2).toUpperCase(),
      color: EXPENSE_COLORS[index % EXPENSE_COLORS.length],
      date: e.expense_date
        ? new Date(e.expense_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : 'N/A',
      status: status.toUpperCase(),
    };
  });
}
