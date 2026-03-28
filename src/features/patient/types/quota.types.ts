export interface QuotaBalance {
  totalAiQuota: number;
  usedAiQuota: number;
  remainingQuota: number;
  quotaSource: 'Free' | 'Purchased' | 'Contract' | 'None';
  unitPrice: number | null;
  // Deprecated compatibility fields from older bundle-based pricing.
  bundlePrice: number | null;
  bundleSize: number | null;
}

export interface BuyQuotaRequest {
  quotaAmount: number;
}

export interface BuyQuotaResponse {
  totalAiQuota: number;
  usedAiQuota: number;
  remainingQuota: number;
  walletBalance: number;
  amountDeducted: number;
}
