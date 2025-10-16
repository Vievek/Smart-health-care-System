import { Ward } from "../models/Ward";
import { BaseRepository } from "../core/base/BaseRepository";
import { IWard } from "@shared/healthcare-types";

export class WardRepository extends BaseRepository<IWard> {
  constructor() {
    super(Ward);
  }

  async findByType(wardType: string): Promise<IWard[]> {
    const results = await this.model.find({ type: wardType });
    return results.map((result: any) => result._doc);
  }

  async findAvailableWards(): Promise<IWard[]> {
    const results = await this.model.find({
      $expr: { $lt: ["$currentOccupancy", "$capacity"] },
    });
    return results.map((result: any) => result._doc);
  }
}
