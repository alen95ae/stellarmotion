export interface Owner {
  id: string;
  name: string;
  slug: string;
  avatar: string;
  rating: number;
  reviewsCount: number;
  memberSince: string;
  languages: string[];
  services: string[];
  description: string;
  verified: boolean;
  city: string;
  country: string;
  products: OwnerProduct[];
}

export interface OwnerProduct {
  id: string;
  slug: string;
  title: string;
  images: string[];
  category: string;
  rating: number;
  reviewsCount: number;
  pricePerMonth: number;
  dimensions: string;
  dailyImpressions: number;
  featured: boolean;
}

export interface OwnerService {
  id: string;
  name: string;
  icon: string;
  description: string;
}
