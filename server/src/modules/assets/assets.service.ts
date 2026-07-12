import { prisma } from "../../config/prisma";
import { AppError } from "../../middleware/error.middleware";
import { logActivity } from "../../utils/activityLogger";

async function generateAssetTag(): Promise<string> {
  const allTags = await prisma.asset.findMany({ select: { assetTag: true } });
  const max = allTags.reduce((acc, curr) => {
    const match = curr.assetTag.match(/^AF-(\d+)$/);
    if (match) return Math.max(acc, parseInt(match[1], 10));
    return acc;
  }, 0);
  return `AF-${(max + 1).toString().padStart(4, "0")}`;
}

export async function createAsset(actorId: string, input: any) {
  let asset;
  for (let i = 0; i < 3; i++) {
    const tag = await generateAssetTag();
    try {
      asset = await prisma.asset.create({
        data: { ...input, assetTag: tag },
      });
      break;
    } catch (e: any) {
      if (e.code === "P2002") continue;
      throw e;
    }
  }
  
  if (!asset) throw new AppError(500, "INTERNAL_ERROR", "Failed to generate unique asset tag");

  await logActivity(actorId, "ASSET_REGISTERED", "ASSET", asset.id);
  return asset;
}

export async function getAsset(id: string) {
  const asset = await prisma.asset.findUnique({ 
    where: { id },
    include: { category: true }
  });
  if (!asset) throw new AppError(404, "NOT_FOUND", "Asset not found");
  return asset;
}

export async function updateAsset(id: string, actorId: string, input: any) {
  const asset = await getAsset(id);
  const updated = await prisma.asset.update({ where: { id }, data: input });
  await logActivity(actorId, "ASSET_UPDATED", "ASSET", id, { updates: input });
  return updated;
}

export async function listAssets(filters: any) {
  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const skip = (page - 1) * limit;

  const where: any = {};
  if (filters.status) where.status = filters.status;
  if (filters.categoryId) where.categoryId = filters.categoryId;
  if (filters.location) where.location = { contains: filters.location, mode: "insensitive" };
  if (filters.search) {
    where.OR = [
      { assetTag: { contains: filters.search, mode: "insensitive" } },
      { serialNumber: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  const [total, items] = await Promise.all([
    prisma.asset.count({ where }),
    prisma.asset.findMany({ where, skip, take: limit, include: { category: true } })
  ]);

  return { total, page, limit, items };
}

export async function getAssetHistory(id: string) {
  return prisma.activityLog.findMany({
    where: { entityType: "ASSET", entityId: id },
    orderBy: { createdAt: "desc" },
    include: { employee: { select: { name: true, email: true } } }
  });
}
