import { AppDataSource } from "../data-source"
import { Factura } from "./Factura"

export class FacturaService {
    private repo = AppDataSource.getRepository(Factura)

    create(data: Partial<Factura>) {
        const factura = this.repo.create(data)
        return this.repo.save(factura)
    }

    findAll() {
        return this.repo.find({ relations: ["detalles", "cliente"] })
    }

    findOne(id: number) {
        return this.repo.findOne({
            where: { id },
            relations: ["detalles", "cliente"],
        })
    }

    update(id: number, data: Partial<Factura>) {
        return this.repo.update(id, data)
    }

    async remove(id: number) {
        const factura = await this.repo.findOneBy({ id })
        if (!factura) return null
        await this.repo.remove(factura)
        return factura
    }
}
