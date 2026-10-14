import { useQuery } from "@tanstack/react-query";
import { getConnectionState, getLatestImport, getRemoteEnquiries } from "./enquiry-sync.services";

export const remoteEnquiriesKey = ["frappe", "enquiry-sync", "remote"] as const;
export const enquiryImportKey = ["frappe", "enquiry-sync", "import"] as const;

export function useRemoteEnquiries(active: boolean, page: number) {
  return useQuery({
    queryKey: [...remoteEnquiriesKey, page],
    queryFn: () => getRemoteEnquiries(page),
    enabled: active
  });
}

export function useEnquiryImport(active: boolean) {
  return useQuery({
    queryKey: enquiryImportKey,
    queryFn: getLatestImport,
    enabled: active,
    refetchInterval: (query) =>
      query.state.data?.status === "pending" || query.state.data?.status === "running"
        ? 2000
        : false
  });
}

export function useConnectionState() {
  return useQuery({ queryKey: ["frappe", "connection"], queryFn: getConnectionState });
}
