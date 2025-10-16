import { InventoryItem } from "../models/Pharmacy";
import { BaseRepository } from "../core/base/BaseRepository";
import { IInventoryItem } from "@shared/healthcare-types";

export class InventoryRepository extends BaseRepository<IInventoryItem> {
  constructor() {
    super(InventoryItem);
  }

  async findLowStockItems(): Promise<IInventoryItem[]> {
    const results = await this.model.find({
      $expr: { $lte: ["$quantityOnHand", "$reorderLevel"] },
    });
    return results.map((result: any) => result._doc);
  }

  async decrementStock(
    medicationId: string,
    quantity: number
  ): Promise<IInventoryItem | null> {
    const result = await this.model.findByIdAndUpdate(
      medicationId,
      { $inc: { quantityOnHand: -quantity } },
      { new: true }
    );
    return result ? (result as any)._doc : null;
  }

  async findByBatchNumber(batchNumber: string): Promise<IInventoryItem | null> {
    const result = await this.model.findOne({ batchNumber });
    return result ? (result as any)._doc : null;
  }
}
