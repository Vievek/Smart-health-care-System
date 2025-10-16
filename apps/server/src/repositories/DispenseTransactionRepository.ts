import { DispenseTransaction } from "../models/Pharmacy";
import { BaseRepository } from "../core/base/BaseRepository";
import { IDispenseTransaction } from "@shared/healthcare-types";

export class DispenseTransactionRepository extends BaseRepository<IDispenseTransaction> {
  constructor() {
    super(DispenseTransaction);
  }

  async findByPatientId(patientId: string): Promise<IDispenseTransaction[]> {
    const results = await this.model
      .find({ patientId })
      .sort({ dispensedAt: -1 });
    return results.map((result: any) => result._doc);
  }

  async findByPrescriptionId(
    prescriptionId: string
  ): Promise<IDispenseTransaction | null> {
    const result = await this.model.findOne({ prescriptionId });
    return result ? (result as any)._doc : null;
  }

  async findRecentTransactions(
    limit: number = 50
  ): Promise<IDispenseTransaction[]> {
    const results = await this.model
      .find()
      .sort({ dispensedAt: -1 })
      .limit(limit);
    return results.map((result: any) => result._doc);
  }
}
