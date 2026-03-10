export function shouldUsePublicNavbar(pathname: string) {
  return pathname === "/" || pathname.startsWith("/courses") || pathname.startsWith("/pricing");
}
