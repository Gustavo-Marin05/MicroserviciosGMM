import { AppDataSource } from "../data-source";
import { Cliente } from "./Cliente";

export class ClienteService {
  private repo = AppDataSource.getRepository(Cliente);

  create(data: Partial<Cliente>) {
    const c = this.repo.create(data);
    return this.repo.save(c);
  }

  findAll() {
    return this.repo.find();
  }

  findOne(id: number) {
    return this.repo.findOneBy({ id });
  }

  update(id: number, data: Partial<Cliente>) {
    return this.repo.update(id, data);
  }

  async remove(id: number) {
    const c = await this.repo.findOneBy({ id });
    if (!c) return null;
    await this.repo.remove(c);
    return c;
  }
}
