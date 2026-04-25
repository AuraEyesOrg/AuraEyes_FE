export interface DrugEntry {
  label: string;
  defaultDosage: string;
  defaultUnit: string;
  defaultFrequency: string;
  defaultInstruction: string;
}

export interface RxItem {
  id: string;
  medicineName: string;
  dosage: string;
  unit: string;
  frequency: string;
  duration: string;
  instruction: string;
}
