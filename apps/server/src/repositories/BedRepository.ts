import { Bed } from "../models/Bed";
import { BaseRepository } from "../core/base/BaseRepository";
import { IBed, BedStatus } from "@shared/healthcare-types";

export class BedRepository extends BaseRepository<IBed> {
  constructor() {
    super(Bed);
  }

  async findAvailableBeds(wardType?: string): Promise<IBed[]> {
    const filter: any = { status: BedStatus.AVAILABLE };
    if (wardType) filter.bedType = wardType;
    const results = await this.model.find(filter);
    return results.map((result: any) => result._doc);
  }

  async findByWardId(wardId: string): Promise<IBed[]> {
    const results = await this.model.find({ wardId });
    return results.map((result: any) => result._doc);
  }

  async countOccupiedBeds(wardId: string): Promise<number> {
    return this.model.countDocuments({
      wardId,
      status: BedStatus.OCCUPIED,
    });
  }

  async findByPatientId(patientId: string): Promise<IBed | null> {
    const result = await this.model.findOne({ patientId });
    return result ? (result as any)._doc : null;
  }
}
