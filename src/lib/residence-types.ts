export type MeResidence = {
  type: "SHOP" | "APARTMENT" | null;
  shop?: {
    slug: string;
    name: string;
    shopSlotId: string;
    streetSlug: string;
    streetName: string;
  };
  apartmentUnit?: {
    id: string;
    buildingNumber: number;
    unitNumber: number;
    streetSlug: string;
    streetName: string;
  };
};

export function buildMeResidence(
  residence: {
    residenceType: "SHOP" | "APARTMENT" | null;
    shop?: {
      slug: string;
      name: string;
      shopSlotId: string;
      shopSlot: { street: { slug: string; nameZh: string } };
    } | null;
    apartmentUnit?: {
      id: string;
      unitNumber: number;
      building: {
        buildingNumber: number;
        street: { slug: string; nameZh: string };
      };
    } | null;
  } | null,
): MeResidence | null {
  if (!residence) return null;

  if (residence.shop) {
    return {
      type: "SHOP",
      shop: {
        slug: residence.shop.slug,
        name: residence.shop.name,
        shopSlotId: residence.shop.shopSlotId,
        streetSlug: residence.shop.shopSlot.street.slug,
        streetName: residence.shop.shopSlot.street.nameZh,
      },
    };
  }

  if (residence.apartmentUnit) {
    const unit = residence.apartmentUnit;
    return {
      type: "APARTMENT",
      apartmentUnit: {
        id: unit.id,
        buildingNumber: unit.building.buildingNumber,
        unitNumber: unit.unitNumber,
        streetSlug: unit.building.street.slug,
        streetName: unit.building.street.nameZh,
      },
    };
  }

  return { type: null };
}
