import { IWard, IBed, BedStatus } from "@shared/healthcare-types";
import { WardRepository } from "../repositories/WardRepository";
import { BedRepository } from "../repositories/BedRepository";
import { IService } from "../core/interfaces/IService";

export class WardService implements IService<IWard> {
  constructor(
    private wardRepo: WardRepository = new WardRepository(),
    private bedRepo: BedRepository = new BedRepository()
  ) {}

  async getById(id: string): Promise<IWard | null> {
    return this.wardRepo.findById(id);
  }

  async getAll(filter?: any): Promise<IWard[]> {
    return this.wardRepo.findAll(filter);
  }

  async create(data: Partial<IWard>): Promise<IWard> {
    return this.wardRepo.create(data);
  }

  async update(id: string, data: Partial<IWard>): Promise<IWard | null> {
    return this.wardRepo.update(id, data);
  }

  async delete(id: string): Promise<boolean> {
    return this.wardRepo.delete(id);
  }

  async allocateBed(bedId: string, patientId: string): Promise<IBed | null> {
    console.log(`Allocating bed ${bedId} to patient ${patientId}`);

    const bed = await this.bedRepo.findById(bedId);
    if (!bed) {
      throw new Error("Bed not found");
    }

    if (bed.status !== BedStatus.AVAILABLE) {
      throw new Error("Bed not available");
    }

    const updatedBed = await this.bedRepo.update(bedId, {
      patientId,
      status: BedStatus.OCCUPIED,
    } as Partial<IBed>);

    // Update ward occupancy
    if (updatedBed) {
      await this.updateWardOccupancy(updatedBed.wardId);
    }

    return updatedBed;
  }

  async transferPatient(
    currentBedId: string,
    newBedId: string
  ): Promise<IBed | null> {
    console.log(`Transferring patient from bed ${currentBedId} to ${newBedId}`);

    const currentBed = await this.bedRepo.findById(currentBedId);
    if (!currentBed || !currentBed.patientId) {
      throw new Error("Current bed not found or no patient assigned");
    }

    const newBed = await this.bedRepo.findById(newBedId);
    if (!newBed || newBed.status !== BedStatus.AVAILABLE) {
      throw new Error("New bed not available");
    }

    const patientId = currentBed.patientId;

    // Free current bed
    await this.bedRepo.update(currentBedId, {
      patientId: undefined,
      status: BedStatus.AVAILABLE,
    } as Partial<IBed>);

    // Allocate new bed
    const updatedBed = await this.bedRepo.update(newBedId, {
      patientId: patientId,
      status: BedStatus.OCCUPIED,
    } as Partial<IBed>);

    // Update ward occupancies
    await this.updateWardOccupancy(currentBed.wardId);
    if (updatedBed) {
      await this.updateWardOccupancy(updatedBed.wardId);
    }

    return updatedBed;
  }

  async dischargePatient(bedId: string): Promise<IBed | null> {
    console.log(`Discharging patient from bed ${bedId}`);

    const bed = await this.bedRepo.findById(bedId);
    if (!bed) {
      throw new Error("Bed not found");
    }

    const updatedBed = await this.bedRepo.update(bedId, {
      patientId: undefined,
      status: BedStatus.AVAILABLE,
    } as Partial<IBed>);

    if (updatedBed) {
      await this.updateWardOccupancy(updatedBed.wardId);
    }

    return updatedBed;
  }

  private async updateWardOccupancy(wardId: string): Promise<void> {
    const occupiedBeds = await this.bedRepo.countOccupiedBeds(wardId);
    await this.wardRepo.update(wardId, {
      currentOccupancy: occupiedBeds,
    } as Partial<IWard>);
  }

  async getAvailableBeds(wardType?: string): Promise<IBed[]> {
    return this.bedRepo.findAvailableBeds(wardType);
  }

  async getBedsByWard(wardId: string): Promise<IBed[]> {
    return this.bedRepo.findByWardId(wardId);
  }

  async getBedsByPatient(patientId: string): Promise<IBed[]> {
    const bed = await this.bedRepo.findByPatientId(patientId);
    return bed ? [bed] : [];
  }

  async getAllBeds(): Promise<IBed[]> {
    return this.bedRepo.findAll();
  }
}
