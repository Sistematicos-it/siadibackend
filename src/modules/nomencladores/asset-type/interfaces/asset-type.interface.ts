export enum ASSET_CATEGORY {
  TECHNOLOGICAL = 'Tecnologico',
  FURNITURE = 'Mobiliario',
}

export interface IAssetType {
  name: string;
  category: ASSET_CATEGORY;
}

export interface IAssetTypeDetails{
    name: string,
    required: boolean
}
