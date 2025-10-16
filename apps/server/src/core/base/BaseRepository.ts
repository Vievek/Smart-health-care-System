import { Model } from "mongoose";
import { IRepository } from "../interfaces/IRepository";

// Simple approach that avoids complex type issues
export abstract class BaseRepository<T> implements IRepository<T> {
  protected model: Model<any>;

  constructor(model: Model<any>) {
    this.model = model;
  }

  async findById(id: string): Promise<T | null> {
    const result = await this.model.findById(id).lean();
    return result as T | null;
  }

  async findAll(filter: any = {}): Promise<T[]> {
    const results = await this.model.find(filter).lean();
    return results as T[];
  }

  async create(entity: Partial<T>): Promise<T> {
    const created = await this.model.create(entity);
    return created.toObject() as T;
  }

  async update(id: string, entity: Partial<T>): Promise<T | null> {
    const updated = await this.model
      .findByIdAndUpdate(id, entity, { new: true })
      .lean();
    return updated as T | null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.model.findByIdAndDelete(id);
    return result !== null;
  }
}
