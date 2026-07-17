export const postsQuery = `*[_type == "post" && status == "published"] | order(publishedAt desc) {
  _id,
  title,
  "slug": slug.current,
  category,
  tag,
  excerpt,
  body,
  "coverImage": coverImage.asset->url,
  author,
  publishedAt,
  status
}`;

export const postBySlugQuery = `*[_type == "post" && slug.current == $slug][0] {
  _id,
  title,
  "slug": slug.current,
  category,
  tag,
  excerpt,
  body,
  "coverImage": coverImage.asset->url,
  author,
  publishedAt,
  status
}`;

export const pendingPostsQuery = `*[_type == "post" && status == "pending"] | order(_createdAt desc) {
  _id,
  title,
  "slug": slug.current,
  category,
  tag,
  excerpt,
  body,
  author,
  publishedAt,
  status
}`;

export const stationsQuery = `*[_type == "station"] | order(name asc) {
  _id,
  name,
  country,
  city,
  zone,
  address,
  lat,
  lng,
  connectorTypes,
  vehicleTypes,
  hours,
  pricing,
  status,
  contactPhone,
  contactEmail,
  operator,
  fastCharging
}`;

export const vehicleListingsQuery = `*[_type == "vehicleListing"] | order(brand asc, model asc) {
  _id,
  brand,
  model,
  vehicleType,
  motor,
  battery,
  maxSpeed,
  range,
  features,
  priceMin,
  priceMax,
  currency,
  source
}`;
