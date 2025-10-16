import { User, Patient, Doctor } from "../models/User";
import { BaseRepository } from "../core/base/BaseRepository";
import { IUser, IPatient, IDoctor } from "@shared/healthcare-types";

export class UserRepository extends BaseRepository<IUser> {
  constructor() {
    super(User);
  }

  async findByNationalId(nationalId: string): Promise<IUser | null> {
    const result = await this.model.findOne({ nationalId });
    return result ? (result as any)._doc : null;
  }

  async findByEmail(email: string): Promise<IUser | null> {
    const result = await this.model.findOne({ email });
    return result ? (result as any)._doc : null;
  }

  async findPatientsByGuardian(guardianId: string): Promise<IPatient[]> {
    const results = await Patient.find({ dependents: guardianId });
    return results.map((result: any) => result._doc);
  }

  async findDoctorsBySpecialization(
    specialization: string
  ): Promise<IDoctor[]> {
    const results = await Doctor.find({ specialization });
    return results.map((result: any) => result._doc);
  }
}
