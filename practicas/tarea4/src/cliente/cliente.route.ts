import { Router } from "express";
import { ClienteService } from "./cliente.service";

const router = Router();
const service = new ClienteService();

router.post("/", async (req, res, next) => { try { res.status(201).json(await service.create(req.body)); } catch (e) { next(e); } });
router.get("/", async (_req, res, next) => { try { res.json(await service.findAll()); } catch (e) { next(e); } });
router.get("/:id", async (req, res, next) => { try { const c = await service.findOne(Number(req.params.id)); if (!c) return res.status(404).json({ error: "Cliente no encontrado" }); res.json(c); } catch (e) { next(e); } });
router.put("/:id", async (req, res, next) => { try { await service.update(Number(req.params.id), req.body); res.json({ updated: true }); } catch (e) { next(e); } });
router.delete("/:id", async (req, res, next) => { try { const d = await service.remove(Number(req.params.id)); if (!d) return res.status(404).json({ error: "Cliente no encontrado" }); res.json(d); } catch (e) { next(e); } });

export default router;
