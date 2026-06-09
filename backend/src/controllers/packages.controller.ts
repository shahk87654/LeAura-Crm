import { type Request, type Response, type NextFunction } from 'express'
import PackageModel from '../models/Package.model.js'

export async function listPackages(_req: Request, res: Response, next: NextFunction) {
  try {
    const packages = await PackageModel.find({ isActive: true })
    res.json({ success: true, data: packages })
  } catch (error) {
    next(error)
  }
}

export async function createPackage(req: Request, res: Response, next: NextFunction) {
  try {
    const packageItem = await PackageModel.create({ ...req.body })
    res.status(201).json({ success: true, data: packageItem })
  } catch (error) {
    next(error)
  }
}

export async function updatePackage(req: Request, res: Response, next: NextFunction) {
  try {
    const packageItem = await PackageModel.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    if (!packageItem) {
      return res.status(404).json({ success: false, error: 'Package not found' })
    }
    res.json({ success: true, data: packageItem })
  } catch (error) {
    next(error)
  }
}

export async function deletePackage(req: Request, res: Response, next: NextFunction) {
  try {
    const packageItem = await PackageModel.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true })
    if (!packageItem) {
      return res.status(404).json({ success: false, error: 'Package not found' })
    }
    res.json({ success: true, data: { id: packageItem.id } })
  } catch (error) {
    next(error)
  }
}
