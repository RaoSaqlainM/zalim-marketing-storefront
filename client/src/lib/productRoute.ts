export function productSlugFromLocation(location: string) {
  const pathname = location.split(/[?#]/)[0];
  return pathname.split("/").at(-1) || "";
}
