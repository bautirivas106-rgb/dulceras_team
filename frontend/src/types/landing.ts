export interface PublicProduct {
  id: string
  name: string
  slug: string
  shortDescription?: string
  price?: number
  formattedPrice?: string
  imageUrl: string
  categoryName?: string
  isFeatured: boolean
  isAvailable: boolean
}

export interface PublicReview {
  id: string
  customerName: string
  username?: string
  comment: string
  avatarUrl?: string
  rating?: number
  createdAt?: string
}

export interface CarouselProductImage {
  id: string
  src: string
  alt: string
  productName?: string
  productSlug?: string
}

export interface FaqItem {
  question: string
  answer: string
}
