import { Apartment } from "./apartment";
import { Review } from "./review";
import { Pet } from "./pet";
import { Score } from "./score";
import { TempApartment } from "./tempApartment";

// export type Property = {
//   ID: number;
//   images: string[];
//   rentLow: number;
//   rentHigh: number;
//   bedroomLow: number;
//   bedroomHigh: number;
//   name?: string;
//   street: string;
//   city: string;
//   state: string;
//   zip: number;
//   lat: number;
//   lng: number;
//   countryCode: string;
//   callingCode: string;
//   phoneNumber: string;
//   website?: string;
//   unitType: "single" | "multiple";
//   description?: string;
//   stars: number;
//   onMarket?: boolean;
//   reviews?: Review[];
//   apartments: Apartment[];
//   scores?: Score[];
//   includedUtilities?: string[];
//   amenities?: string[];
//   petsAllowed: string;
//   laundryType: string;
//   parkingFee?: number;
//   firstName: string;
//   lastName: string;
//   email: string;
//   userID: number;
//   liked?: boolean;
// };


export type Property = {
  ID: number;
  images: string[];
  rentLow: number;
  rentHigh: number;
  bedroomLow: number;
  bedroomHigh: number;
  name: string;
  street: string;
  city: string;
  state: string;
  zip: number;
  tags: string[];
  lat: number;
  lng: number;
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