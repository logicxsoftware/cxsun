import { CrmResponseFormatError, crmRequest } from "../../crm-request";
import type {
  CrmDataSourceProvider,
  CrmEnquiryDataSource,
  CrmFrappeConnection
} from "./data-source.types";

export const getCrmEnquiryDataSource = () =>
  crmRequest<CrmEnquiryDataSource>("/crm/enquiries/source");

export const getCrmFrappeConnection = () =>
  crmRequest<CrmFrappeConnection>("/frappe/connection");

export async function saveCrmEnquiryDataSource(provider: CrmDataSourceProvider) {
  try {
    return await crmRequest<CrmEnquiryDataSource>("/frappe/data-sources/crm.enquiries", {
      method: "PUT",
      body: JSON.stringify({ provider })
    });
  } catch (error) {
    if (!(error instanceof CrmResponseFormatError)) throw error;
    try {
      const saved = await getCrmEnquiryDataSource();
      if (saved.provider === provider) return saved;
    } catch {
      throw new Error("The source change could not be confirmed. Refresh before trying again.");
    }
    throw new Error("The source change was not saved. Refresh before trying again.");
  }
}
