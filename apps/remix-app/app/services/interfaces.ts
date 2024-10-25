export interface IImage {
  image_url: string;
  name: string;
  thumbnail_url: string;
}

interface IAgencyType {
  id: number;
  name: string;
}

export interface IAgency {
  id: number;
  name: string;
  url: string;
  abbrev: string;
  type: IAgencyType;
}

export interface IUpdate {
  id: number;
  profile_image: string;
  comment: string;
  created_by: string;
  created_on: string;
  info_url: string;
}

export interface IProgram {
  id: number;
  name: string;
  image: IImage;
  info_url: string;
  wiki_url: string;
  description: string;
  agencies: IAgency[];
}
