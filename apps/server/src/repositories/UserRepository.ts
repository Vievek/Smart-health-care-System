import { User, Patient, Doctor } from "../models/User";
import { BaseRepository } from "../core/base/BaseRepository";
import { IUser, IPatient, IDoctor } from "@shared/healthcare-types";

export class UserRepository extends BaseRepository<IUser> {
  constructor() {
    super(User);
  }

  async findByNationalId(nationalId: string): Promise<IUser | null> {
    try {
      const result = await this.model.findOne({ nationalId });
      return result ? result.toObject() : null;
    } catch (error) {
      console.error("Error in findByNationalId:", error);
      return null;
    }
  }

  async findByEmail(email: string): Promise<IUser | null> {
    try {
      const result = await this.model.findOne({ email });
      return result ? result.toObject() : null;
    } catch (error) {
      console.error("Error in findByEmail:", error);
      return null;
    }
  }

  async findPatientsByGuardian(guardianId: string): Promise<IPatient[]> {
    try {
      const results = await Patient.find({ dependents: guardianId });
      return results.map((result: any) => result.toObject());
    } catch (error) {
      console.error("Error in findPatientsByGuardian:", error);
      return [];
    }
  }

  async findDoctorsBySpecialization(
    specialization: string
  ): Promise<IDoctor[]> {
    try {
      const results = await Doctor.find({ specialization });
      return results.map((result: any) => result.toObject());
    } catch (error) {
      console.error("Error in findDoctorsBySpecialization:", error);
      return [];
    }
  }
}
