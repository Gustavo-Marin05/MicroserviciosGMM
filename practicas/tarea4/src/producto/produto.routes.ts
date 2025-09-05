import { Router } from "express";
import { ProductoService } from "./producto.service";

const router = Router();
const service = new ProductoService();

router.post("/", async (req, res, next) => {
  try { const p = await service.create(req.body); res.status(201).json(p); } catch (e) { next(e); }
});

router.get("/", async (_req, res, next) => { try { res.json(await service.findAll()); } catch (e) { next(e); } });

router.get("/:id", async (req, res, next) => {
  try {
    const p = await service.findOne(Number(req.params.id));
    if (!p) return res.status(404).json({ error: "Producto no encontrado" });
    res.json(p);
  } catch (e) { next(e); }
});

router.put("/:id", async (req, res, next) => { try { await service.update(Number(req.params.id), req.body); res.json({ updated: true }); } catch (e) { next(e); } });

router.delete("/:id", async (req, res, next) => {
  try {
    const deleted = await service.remove(Number(req.params.id));
    if (!deleted) return res.status(404).json({ error: "Producto no encontrado" });
    res.json(deleted);
  } catch (e) { next(e); }
});

export default router;
