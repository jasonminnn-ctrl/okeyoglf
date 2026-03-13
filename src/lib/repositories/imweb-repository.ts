import { supabase } from "@/integrations/supabase/client";
import type {
  ExternalConnectionStatus,
  ImwebMemberSyncSummary,
  ProductMembershipMapping,
  PointCreditMapping,
  ExternalSyncHistoryItem,
  ExternalSyncExceptionItem,
} from "@/lib/external-integrations";

export type ImwebConnectionStatus =
  | "pending"
  | "connected"
  | "disconnected"
  | "testing"
  | "error";

export type ImwebGrantMode = "auto" | "manual_review" | "manual_only";

export type ImwebOrderProcessingStatus =
  | "received"
  | "mapped"
  | "manual_review"
  | "applied"
  | "failed"
  | "ignored";

export type ImwebMemberLinkStatus =
  | "linked"
  | "unlinked"
  | "needs_review"
  | "sync_failed";

export type ImwebMemberSyncStatus = "pending" | "synced" | "failed";

export interface ImwebSiteConnectionRow {
  id: string;
  org_id: string;
  external_provider: "imweb";
  site_code: string;
  connection_status: ImwebConnectionStatus;
  webhook_url: string | null;
  webhook_registered: boolean;
  last_synced_at: string | null;
  last_event_at: string | null;
  last_event_type: string | null;
  last_error: string | null;
  note: string | null;
  created_at: string;
  updated_at: string;
}

export interface ImwebProductMembershipMappingRow {
  id: string;
  org_id: string;
  site_connection_id: string;
  external_product_code: string;
  external_product_name: string;
  mapped_membership_code: ProductMembershipMapping["mappedMembershipCode"];
  mapped_membership_label: string | null;
  is_active: boolean;
  note: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ImwebPointCreditMappingRow {
  id: string;
  org_id: string;
  site_connection_id: string;
  external_point_product_code: string;
  external_point_product_name: string;
  mapped_credit_amount: number;
  grant_mode: ImwebGrantMode;
  is_active: boolean;
  note: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ImwebOrderEventRow {
  id: string;
  org_id: string;
  site_connection_id: string;
  external_provider: "imweb";
  event_type: string;
  external_order_id: string | null;
  external_member_id: string | null;
  external_product_code: string | null;
  external_product_name: string | null;
  paid_amount: number | null;
  currency_code: string;
  ordered_at: string | null;
  order_status: string | null;
  processing_status: ImwebOrderProcessingStatus;
  processing_error: string | null;
  processed_at: string | null;
  processed_by: string | null;
  retry_count: number;
  idempotency_key: string | null;
  payload: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface ImwebMemberLinkRow {
  id: string;
  org_id: string;
  site_connection_id: string;
  external_provider: "imweb";
  external_member_id: string;
  member_name: string | null;
  email: string | null;
  phone: string | null;
  linked_profile_id: string | null;
  link_status: ImwebMemberLinkStatus;
  sync_status: ImwebMemberSyncStatus;
  first_linked_at: string | null;
  last_synced_at: string | null;
  note: string | null;
  created_at: string;
  updated_at: string;
}

export interface UpsertImwebSiteConnectionInput {
  orgId: string;
  siteCode: string;
  connectionStatus?: ImwebConnectionStatus;
  webhookUrl?: string | null;
  webhookRegistered?: boolean;
  lastSyncedAt?: string | null;
  lastEventAt?: string | null;
  lastEventType?: string | null;
  lastError?: string | null;
  note?: string | null;
}

export interface UpsertImwebProductMembershipMappingInput {
  orgId: string;
  siteConnectionId: string;
  externalProductCode: string;
  externalProductName: string;
  mappedMembershipCode: ProductMembershipMapping["mappedMembershipCode"];
  mappedMembershipLabel?: string | null;
  isActive?: boolean;
  note?: string | null;
  createdBy?: string | null;
}

export interface UpsertImwebPointCreditMappingInput {
  orgId: string;
  siteConnectionId: string;
  externalPointProductCode: string;
  externalPointProductName: string;
  mappedCreditAmount: number;
  grantMode?: ImwebGrantMode;
  isActive?: boolean;
  note?: string | null;
  createdBy?: string | null;
}

export interface UpsertImwebOrderEventInput {
  orgId: string;
  siteConnectionId: string;
  eventType: string;
  externalOrderId?: string | null;
  externalMemberId?: string | null;
  externalProductCode?: string | null;
  externalProductName?: string | null;
  paidAmount?: number | null;
  currencyCode?: string;
  orderedAt?: string | null;
  orderStatus?: string | null;
  processingStatus?: ImwebOrderProcessingStatus;
  processingError?: string | null;
  processedAt?: string | null;
  processedBy?: string | null;
  retryCount?: number;
  idempotencyKey?: string | null;
  payload?: Record<string, unknown>;
}

export interface UpsertImwebMemberLinkInput {
  orgId: string;
  siteConnectionId: string;
  externalMemberId: string;
  memberName?: string | null;
  email?: string | null;
  phone?: string | null;
  linkedProfileId?: string | null;
  linkStatus?: ImwebMemberLinkStatus;
  syncStatus?: ImwebMemberSyncStatus;
  firstLinkedAt?: string | null;
  lastSyncedAt?: string | null;
  note?: string | null;
}

export interface ImwebListFilter {
  orgId: string;
  siteConnectionId?: string;
  limit?: number;
}

export interface ImwebOrderEventFilter extends ImwebListFilter {
  processingStatus?: ImwebOrderProcessingStatus;
  eventType?: string;
  externalOrderId?: string;
}

export interface ImwebMemberLinkFilter extends ImwebListFilter {
  linkStatus?: ImwebMemberLinkStatus;
  syncStatus?: ImwebMemberSyncStatus;
  linkedProfileId?: string;
}

function normalizeConnectionStatus(
  value: string | null | undefined,
): ExternalConnectionStatus {
  if (
    value === "connected" ||
    value === "pending" ||
    value === "disconnected" ||
    value === "testing" ||
    value === "error"
  ) {
    return value;
  }
  return "pending";
}

function mapSiteConnectionToSummary(
  row: ImwebSiteConnectionRow,
): ImwebMemberSyncSummary {
  return {
    externalProvider: "imweb",
    webhookUrl: row.webhook_url,
    syncStatus: normalizeConnectionStatus(row.connection_status),
    lastSyncedAt: row.last_synced_at,
    lastEventLabel: row.last_event_type ?? "—",
    note: row.note ?? "",
  };
}

function mapMembershipMapping(
  row: ImwebProductMembershipMappingRow,
): ProductMembershipMapping {
  return {
    externalProductName: row.external_product_name,
    externalProductCode: row.external_product_code,
    mappedMembershipCode: row.mapped_membership_code,
    mappedMembershipLabel:
      row.mapped_membership_label ?? membershipCodeToLabel(row.mapped_membership_code),
    isActive: row.is_active,
    note: row.note ?? "",
  };
}

function mapPointCreditMapping(
  row: ImwebPointCreditMappingRow,
): PointCreditMapping {
  return {
    externalPointProductName: row.external_point_product_name,
    externalPointProductCode: row.external_point_product_code,
    mappedCreditAmount: row.mapped_credit_amount,
    grantMode: row.grant_mode,
    isActive: row.is_active,
    note: row.note ?? "",
  };
}

function membershipCodeToLabel(
  code: ProductMembershipMapping["mappedMembershipCode"],
): string {
  switch (code) {
    case "standard":
      return "스탠다드";
    case "pro":
      return "프로";
    case "enterprise":
      return "엔터프라이즈";
    default:
      return code;
  }
}

function inferHistoryActionType(
  row: ImwebOrderEventRow,
): ExternalSyncHistoryItem["actionType"] {
  const normalized = row.event_type.toLowerCase();

  if (
    normalized.includes("refund") ||
    normalized.includes("cancel") ||
    normalized.includes("revert")
  ) {
    return "refund_revert";
  }

  if (normalized.includes("credit") || normalized.includes("point")) {
    return "credit_grant";
  }

  return "membership_sync";
}

function inferExceptionType(
  row: ImwebOrderEventRow,
): ExternalSyncExceptionItem["exceptionType"] {
  const normalizedEvent = row.event_type.toLowerCase();
  const normalizedError = (row.processing_error ?? "").toLowerCase();

  if (normalizedError.includes("duplicate")) {
    return "duplicate_order";
  }

  if (normalizedEvent.includes("refund")) {
    return "refund_pending";
  }

  if (normalizedError.includes("unmapped")) {
    return "unmapped_product";
  }

  return "sync_failed";
}

function mapOrderEventToHistory(
  row: ImwebOrderEventRow,
): ExternalSyncHistoryItem {
  return {
    historyId: row.id,
    externalProvider: "imweb",
    externalOrderId: row.external_order_id,
    actionType: inferHistoryActionType(row),
    status: normalizeConnectionStatus(
      row.processing_status === "failed"
        ? "error"
        : row.processing_status === "manual_review"
          ? "pending"
          : row.processing_status === "applied"
            ? "connected"
            : "pending",
    ),
    processedAt: row.processed_at,
    processedBy: row.processed_by ?? "system",
    note: row.processing_error ?? row.event_type,
  };
}

function mapOrderEventToException(
  row: ImwebOrderEventRow,
): ExternalSyncExceptionItem {
  return {
    exceptionId: row.id,
    exceptionType: inferExceptionType(row),
    status: normalizeConnectionStatus(
      row.processing_status === "failed" ? "error" : "pending",
    ),
    note: row.processing_error ?? row.event_type,
    canRetry: row.processing_status === "failed" || row.processing_status === "manual_review",
  };
}

function applyOptionalEq<TQuery extends { eq: Function }>(
  query: TQuery,
  column: string,
  value: string | undefined,
): TQuery {
  if (!value) return query;
  return query.eq(column, value);
}

function assertPositiveLimit(limit?: number): number {
  if (!limit || Number.isNaN(limit) || limit <= 0) return 50;
  return Math.min(limit, 200);
}

export async function getImwebSiteConnections(
  orgId: string,
): Promise<ImwebSiteConnectionRow[]> {
  const { data, error } = await supabase
    .from("imweb_site_connections" as any)
    .select("*")
    .eq("org_id", orgId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as unknown as ImwebSiteConnectionRow[];
}

export async function getImwebMemberSyncSummary(
  orgId: string,
): Promise<ImwebMemberSyncSummary | null> {
  const { data, error } = await supabase
    .from("imweb_site_connections" as any)
    .select("*")
    .eq("org_id", orgId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return mapSiteConnectionToSummary(data as unknown as ImwebSiteConnectionRow);
}

export async function upsertImwebSiteConnection(
  input: UpsertImwebSiteConnectionInput,
): Promise<ImwebSiteConnectionRow> {
  const payload = {
    org_id: input.orgId,
    external_provider: "imweb" as const,
    site_code: input.siteCode,
    connection_status: input.connectionStatus ?? "pending",
    webhook_url: input.webhookUrl ?? null,
    webhook_registered: input.webhookRegistered ?? false,
    last_synced_at: input.lastSyncedAt ?? null,
    last_event_at: input.lastEventAt ?? null,
    last_event_type: input.lastEventType ?? null,
    last_error: input.lastError ?? null,
    note: input.note ?? null,
  };

  const { data, error } = await supabase
    .from("imweb_site_connections" as any)
    .upsert(payload, {
      onConflict: "org_id,site_code",
    })
    .select("*")
    .single();

  if (error) throw error;
  return data as unknown as ImwebSiteConnectionRow;
}

export async function getProductMembershipMappings(
  filter: ImwebListFilter,
): Promise<ProductMembershipMapping[]> {
  let query = supabase
    .from("imweb_product_membership_mappings" as any)
    .select("*")
    .eq("org_id", filter.orgId)
    .order("created_at", { ascending: true });

  query = applyOptionalEq(query, "site_connection_id", filter.siteConnectionId);

  const { data, error } = await query;
  if (error) throw error;

  return ((data ?? []) as unknown as ImwebProductMembershipMappingRow[]).map(
    mapMembershipMapping,
  );
}

export async function upsertProductMembershipMapping(
  input: UpsertImwebProductMembershipMappingInput,
): Promise<ImwebProductMembershipMappingRow> {
  const payload = {
    org_id: input.orgId,
    site_connection_id: input.siteConnectionId,
    external_product_code: input.externalProductCode,
    external_product_name: input.externalProductName,
    mapped_membership_code: input.mappedMembershipCode,
    mapped_membership_label:
      input.mappedMembershipLabel ??
      membershipCodeToLabel(input.mappedMembershipCode),
    is_active: input.isActive ?? true,
    note: input.note ?? null,
    created_by: input.createdBy ?? null,
  };

  const { data, error } = await supabase
    .from("imweb_product_membership_mappings" as any)
    .upsert(payload, {
      onConflict: "org_id,site_connection_id,external_product_code",
    })
    .select("*")
    .single();

  if (error) throw error;
  return data as unknown as ImwebProductMembershipMappingRow;
}

export async function getPointCreditMappings(
  filter: ImwebListFilter,
): Promise<PointCreditMapping[]> {
  let query = supabase
    .from("imweb_point_credit_mappings" as any)
    .select("*")
    .eq("org_id", filter.orgId)
    .order("mapped_credit_amount", { ascending: true });

  query = applyOptionalEq(query, "site_connection_id", filter.siteConnectionId);

  const { data, error } = await query;
  if (error) throw error;

  return ((data ?? []) as unknown as ImwebPointCreditMappingRow[]).map(mapPointCreditMapping);
}

export async function upsertPointCreditMapping(
  input: UpsertImwebPointCreditMappingInput,
): Promise<ImwebPointCreditMappingRow> {
  const payload = {
    org_id: input.orgId,
    site_connection_id: input.siteConnectionId,
    external_point_product_code: input.externalPointProductCode,
    external_point_product_name: input.externalPointProductName,
    mapped_credit_amount: input.mappedCreditAmount,
    grant_mode: input.grantMode ?? "manual_review",
    is_active: input.isActive ?? true,
    note: input.note ?? null,
    created_by: input.createdBy ?? null,
  };

  const { data, error } = await supabase
    .from("imweb_point_credit_mappings" as any)
    .upsert(payload, {
      onConflict: "org_id,site_connection_id,external_point_product_code",
    })
    .select("*")
    .single();

  if (error) throw error;
  return data as unknown as ImwebPointCreditMappingRow;
}

export async function getOrderEvents(
  filter: ImwebOrderEventFilter,
): Promise<ImwebOrderEventRow[]> {
  let query = supabase
    .from("imweb_order_events" as any)
    .select("*")
    .eq("org_id", filter.orgId)
    .order("created_at", { ascending: false })
    .limit(assertPositiveLimit(filter.limit));

  query = applyOptionalEq(query, "site_connection_id", filter.siteConnectionId);
  query = applyOptionalEq(query, "processing_status", filter.processingStatus);
  query = applyOptionalEq(query, "event_type", filter.eventType);
  query = applyOptionalEq(query, "external_order_id", filter.externalOrderId);

  const { data, error } = await query;
  if (error) throw error;

  return (data ?? []) as unknown as ImwebOrderEventRow[];
}

export async function upsertOrderEvent(
  input: UpsertImwebOrderEventInput,
): Promise<ImwebOrderEventRow> {
  const payload = {
    org_id: input.orgId,
    site_connection_id: input.siteConnectionId,
    external_provider: "imweb" as const,
    event_type: input.eventType,
    external_order_id: input.externalOrderId ?? null,
    external_member_id: input.externalMemberId ?? null,
    external_product_code: input.externalProductCode ?? null,
    external_product_name: input.externalProductName ?? null,
    paid_amount: input.paidAmount ?? null,
    currency_code: input.currencyCode ?? "KRW",
    ordered_at: input.orderedAt ?? null,
    order_status: input.orderStatus ?? null,
    processing_status: input.processingStatus ?? "received",
    processing_error: input.processingError ?? null,
    processed_at: input.processedAt ?? null,
    processed_by: input.processedBy ?? null,
    retry_count: input.retryCount ?? 0,
    idempotency_key: input.idempotencyKey ?? null,
    payload: input.payload ?? {},
  };

  const { data, error } = await supabase
    .from("imweb_order_events" as any)
    .upsert(payload, {
      onConflict: "idempotency_key",
      ignoreDuplicates: false,
    })
    .select("*")
    .single();

  if (error) throw error;
  return data as unknown as ImwebOrderEventRow;
}

export async function getSyncHistoryItems(
  filter: ImwebOrderEventFilter,
): Promise<ExternalSyncHistoryItem[]> {
  const rows = await getOrderEvents(filter);
  return rows.map(mapOrderEventToHistory);
}

export async function getSyncExceptionItems(
  filter: ImwebOrderEventFilter,
): Promise<ExternalSyncExceptionItem[]> {
  const rows = await getOrderEvents({
    ...filter,
    processingStatus: filter.processingStatus ?? "failed",
  });

  return rows.map(mapOrderEventToException);
}

export async function getMemberLinks(
  filter: ImwebMemberLinkFilter,
): Promise<ImwebMemberLinkRow[]> {
  let query = supabase
    .from("imweb_member_links" as any)
    .select("*")
    .eq("org_id", filter.orgId)
    .order("updated_at", { ascending: false })
    .limit(assertPositiveLimit(filter.limit));

  query = applyOptionalEq(query, "site_connection_id", filter.siteConnectionId);
  query = applyOptionalEq(query, "link_status", filter.linkStatus);
  query = applyOptionalEq(query, "sync_status", filter.syncStatus);
  query = applyOptionalEq(query, "linked_profile_id", filter.linkedProfileId);

  const { data, error } = await query;
  if (error) throw error;

  return (data ?? []) as ImwebMemberLinkRow[];
}

export async function upsertMemberLink(
  input: UpsertImwebMemberLinkInput,
): Promise<ImwebMemberLinkRow> {
  const payload = {
    org_id: input.orgId,
    site_connection_id: input.siteConnectionId,
    external_provider: "imweb" as const,
    external_member_id: input.externalMemberId,
    member_name: input.memberName ?? null,
    email: input.email ?? null,
    phone: input.phone ?? null,
    linked_profile_id: input.linkedProfileId ?? null,
    link_status: input.linkStatus ?? "needs_review",
    sync_status: input.syncStatus ?? "pending",
    first_linked_at: input.firstLinkedAt ?? null,
    last_synced_at: input.lastSyncedAt ?? null,
    note: input.note ?? null,
  };

  const { data, error } = await supabase
    .from("imweb_member_links" as any)
    .upsert(payload, {
      onConflict: "org_id,external_provider,external_member_id",
    })
    .select("*")
    .single();

  if (error) throw error;
  return data as ImwebMemberLinkRow;
}
