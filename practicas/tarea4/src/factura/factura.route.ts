import { Router } from "express"
import { FacturaService } from "./factura.service"

const router = Router()
const service = new FacturaService()

router.post("/", async (req, res) => {
    const factura = await service.create(req.body)
    res.json(factura)
})

router.get("/", async (req, res) => {
    const facturas = await service.findAll()
    res.json(facturas)
})

router.get("/:id", async (req, res) => {
    const factura = await service.findOne(Number(req.params.id))
    res.json(factura)
})

router.put("/:id", async (req, res) => {
    const updated = await service.update(Number(req.params.id), req.body)
    res.json(updated)
})

router.delete("/:id", async (req, res) => {
    const deleted = await service.remove(Number(req.params.id))
    res.json(deleted)
})

export default router
