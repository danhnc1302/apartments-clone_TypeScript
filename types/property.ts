import { Apartment } from "./apartment";
import { Review } from "./review";
import { Pet } from "./pet";
import { Score } from "./score";
import { TempApartment } from "./tempApartment";

export type Property = {
  ID: number;
  images: string[];
  about: string;
  rentLow: number;
  tags: string[];
  pets: Pet[];
  features: string[];
  rentHigh: number;
  bedroomLow: number;
  bedroomHigh: number;
  name?: string;
  street: string;
  city: string;
  state: string;
  zip: number;
  lat: number;
  lng: number;
  phoneNumber: string;
  website?: string;
  unitType: "single" | "multiple";
  description?: string;
  stars: number;
  reviews?: Review[];
  apartments: Apartment[];
  scores?: Score[];
  parkingFee?: number;
};

export type CreateProperty = {
  unitType: string;
  propertyType: string;
  street: string;
  city: string;
  state: string;
  zip: number;
  lat: number;
  lng: number;
  userID: number;
  apartments: {
    unit?: string;
    bedrooms: number;
    bathrooms: number;
    active: boolean;
    availableOn: Date;
  }[];
};

export type EditPropertyObj = {
  ID?: number;
  unitType?: "single" | "multiple";
  apartments: TempApartment[];
  description: string;
  images: string[];
  includedUtilities: string[];
  petsAllowed: string;
  laundryType: string;
  parkingFee: number;
  amenities: string[];
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  callingCode?: string;
  countryCode?: string;
  phoneNumber: string;
  website: string;
  onMarket: boolean;
};