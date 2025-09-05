import { AppDataSource } from "../data-source";
import { Producto } from "./Producto";

export class ProductoService {
  private repo = AppDataSource.getRepository(Producto);

  create(data: Partial<Producto>) {
    const p = this.repo.create(data);
    return this.repo.save(p);
  }

  findAll() {
    return this.repo.find();
  }

  findOne(id: number) {
    return this.repo.findOneBy({ id });
  }

  update(id: number, data: Partial<Producto>) {
    return this.repo.update(id, data);
  }

  async remove(id: number) {
    const p = await this.repo.findOneBy({ id });
    if (!p) return null;
    await this.repo.remove(p);
    return p;
  }
}
