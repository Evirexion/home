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
  zone,
  address,
  lat,
  lng,
  connectorTypes,
  vehicleTypes,
  hours,
  contactPhone,
  contactEmail,
  operator,
  fastCharging
}`;

export const vehiclePricesQuery = `*[_type == "vehiclePrice"] | order(brand asc, model asc, year desc) {
  _id,
  vehicleType,
  brand,
  model,
  year,
  condition,
  buyPrice,
  sellPrice,
  currency
}`;
