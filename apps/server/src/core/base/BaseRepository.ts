import { Model } from "mongoose";
import { IRepository } from "../interfaces/IRepository";

export abstract class BaseRepository<T> implements IRepository<T> {
  protected model: Model<any>;

  constructor(model: Model<any>) {
    this.model = model;
  }

  async findById(id: string): Promise<T | null> {
    try {
      const result = await this.model.findById(id);
      return result ? result.toObject() : null;
    } catch (error) {
      console.error(`Error in findById for ${this.model.modelName}:`, error);
      return null;
    }
  }

  async findAll(filter: any = {}): Promise<T[]> {
    try {
      const results = await this.model.find(filter);
      return results.map((result: any) => result.toObject());
    } catch (error) {
      console.error(`Error in findAll for ${this.model.modelName}:`, error);
      return [];
    }
  }

  async create(entity: Partial<T>): Promise<T> {
    try {
      const created = await this.model.create(entity);
      return created.toObject();
    } catch (error) {
      console.error(`Error in create for ${this.model.modelName}:`, error);
      throw error;
    }
  }

  async update(id: string, entity: Partial<T>): Promise<T | null> {
    try {
      const updated = await this.model.findByIdAndUpdate(id, entity, {
        new: true,
      });
      return updated ? updated.toObject() : null;
    } catch (error) {
      console.error(`Error in update for ${this.model.modelName}:`, error);
      return null;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await this.model.findByIdAndDelete(id);
      return result !== null;
    } catch (error) {
      console.error(`Error in delete for ${this.model.modelName}:`, error);
      return false;
    }
  }
}
