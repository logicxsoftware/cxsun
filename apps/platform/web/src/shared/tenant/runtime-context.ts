const COMPANY_CONTEXT_STORAGE_KEY = "cxsun.tenant.company-id";
const ACCOUNTING_YEAR_CONTEXT_STORAGE_KEY = "cxsun.tenant.financial-year-id";

export function publishCompanyContext(id: number) {
  window.sessionStorage.setItem(COMPANY_CONTEXT_STORAGE_KEY, String(id));
  window.dispatchEvent(new CustomEvent("cxsun:company-change", { detail: { id } }));
}

export function publishAccountingYear(id: number) {
  window.sessionStorage.setItem(ACCOUNTING_YEAR_CONTEXT_STORAGE_KEY, String(id));
  window.dispatchEvent(new CustomEvent("cxsun:accounting-year-change", { detail: { id } }));
}
