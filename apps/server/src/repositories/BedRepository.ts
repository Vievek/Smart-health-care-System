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
    return results.map((result: any) => result.toObject());
  }

  async findByWardId(wardId: string): Promise<IBed[]> {
    const results = await this.model.find({ wardId });
    return results.map((result: any) => result.toObject());
  }

  async countOccupiedBeds(wardId: string): Promise<number> {
    return this.model.countDocuments({
      wardId,
      status: BedStatus.OCCUPIED,
    });
  }

  async findByPatientId(patientId: string): Promise<IBed | null> {
    const result = await this.model.findOne({
      patientId,
      status: BedStatus.OCCUPIED,
    });
    return result ? result.toObject() : null;
  }

  async updatePatientBed(
    patientId: string,
    bedId: string
  ): Promise<IBed | null> {
    // Clear any existing bed for this patient using $unset
    await this.model.updateMany(
      { patientId, status: BedStatus.OCCUPIED },
      { $unset: { patientId: "" }, status: BedStatus.AVAILABLE }
    );

    // Assign new bed
    const result = await this.model.findByIdAndUpdate(
      bedId,
      { patientId, status: BedStatus.OCCUPIED },
      { new: true }
    );
    return result ? result.toObject() : null;
  }
}
