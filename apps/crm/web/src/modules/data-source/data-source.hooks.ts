import { useQuery } from "@tanstack/react-query";
import { getCrmEnquiryDataSource, getCrmFrappeConnection } from "./data-source.services";

export const crmDataSourceQueryKey = ["crm", "enquiries", "source"] as const;

export function useCrmDataSource(frappeEnabled: boolean) {
  const source = useQuery({ queryKey: crmDataSourceQueryKey, queryFn: getCrmEnquiryDataSource });
  const connection = useQuery({
    queryKey: ["crm", "data-source", "frappe-connection"],
    queryFn: getCrmFrappeConnection,
    enabled: frappeEnabled
  });
  return { source, connection };
}
