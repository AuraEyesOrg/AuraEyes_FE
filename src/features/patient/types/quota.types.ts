export interface QuotaBalance {
  totalAiQuota: number;
  remainingQuota: number;
  quotaSource: 'Free' | 'Purchased' | 'Contract' | 'None';
  unitPrice: number | null;
}

export interface BuyQuotaRequest {
  quotaAmount: number;
}

export interface BuyQuotaResponse {
  totalAiQuota: number;
  remainingQuota: number;
  walletBalance: number;
  amountDeducted: number;
}
