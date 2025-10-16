import {
  IInventoryItem,
  IDispenseTransaction,
  PaymentStatus,
  PrescriptionStatus,
} from "@shared/healthcare-types"; // Remove unused UserRole import
import { InventoryRepository } from "../repositories/InventoryRepository";
import { DispenseTransactionRepository } from "../repositories/DispenseTransactionRepository";
import { MedicalRecordService } from "./MedicalRecordService";
import { IService } from "../core/interfaces/IService";

export class PharmacyService implements IService<IInventoryItem> {
  private inventoryRepo: InventoryRepository;
  private transactionRepo: DispenseTransactionRepository;
  private medicalRecordService: MedicalRecordService;

  constructor(
    inventoryRepo?: InventoryRepository,
    transactionRepo?: DispenseTransactionRepository,
    medicalRecordService?: MedicalRecordService
  ) {
    this.inventoryRepo = inventoryRepo || new InventoryRepository();
    this.transactionRepo =
      transactionRepo || new DispenseTransactionRepository();
    this.medicalRecordService =
      medicalRecordService || new MedicalRecordService();
  }

  async getById(id: string): Promise<IInventoryItem | null> {
    return this.inventoryRepo.findById(id);
  }

  async getAll(filter?: any): Promise<IInventoryItem[]> {
    return this.inventoryRepo.findAll(filter);
  }

  async create(data: Partial<IInventoryItem>): Promise<IInventoryItem> {
    return this.inventoryRepo.create(data);
  }

  async update(
    id: string,
    data: Partial<IInventoryItem>
  ): Promise<IInventoryItem | null> {
    return this.inventoryRepo.update(id, data);
  }

  async delete(id: string): Promise<boolean> {
    return this.inventoryRepo.delete(id);
  }

  async dispenseMedication(dispenseData: {
    prescriptionId: string;
    patientId: string;
    pharmacistId: string;
    medications: Array<{ medicationId: string; quantity: number }>;
    paymentMethod?: string;
  }): Promise<IDispenseTransaction> {
    // Check prescription validity
    const prescription = await this.medicalRecordService.getById(
      dispenseData.prescriptionId
    );
    if (!prescription || prescription.recordType !== "prescription") {
      throw new Error("Invalid prescription");
    }

    // Check stock availability and calculate total
    let totalAmount = 0;
    for (const item of dispenseData.medications) {
      const medication = await this.inventoryRepo.findById(item.medicationId);
      if (!medication || medication.quantityOnHand < item.quantity) {
        throw new Error(`Insufficient stock for ${medication?.name}`);
      }
      totalAmount += medication.price * item.quantity;
    }

    // Create transaction
    const transaction = await this.transactionRepo.create({
      ...dispenseData,
      amount: totalAmount,
      paymentStatus: dispenseData.paymentMethod
        ? PaymentStatus.COMPLETED
        : PaymentStatus.PENDING,
      dispensedAt: new Date(),
    } as IDispenseTransaction);

    // Update inventory
    for (const item of dispenseData.medications) {
      await this.inventoryRepo.decrementStock(item.medicationId, item.quantity);
    }

    // Update prescription status
    await this.medicalRecordService.update(dispenseData.prescriptionId, {
      prescription: {
        ...prescription.prescription!,
        status: PrescriptionStatus.DISPENSED,
      },
    });

    return transaction;
  }

  async checkDrugInteractions(
    _patientId: string, // Prefix with underscore
    newMedications: string[]
  ): Promise<string[]> {
    // Simple interaction check (in real system, integrate with drug interaction API)
    const interactions: string[] = [];

    // Implementation would check against known drug interactions
    // This is a simplified version
    if (newMedications.some((med) => med.toLowerCase().includes("warfarin"))) {
      interactions.push("Warfarin may interact with other blood thinners");
    }

    return interactions;
  }

  async getLowStockItems(): Promise<IInventoryItem[]> {
    return this.inventoryRepo.findLowStockItems();
  }
}
