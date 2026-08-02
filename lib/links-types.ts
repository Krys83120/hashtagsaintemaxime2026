export interface SiteLink {
  label: string;
  url: string;
  section: string;
}

export function linksBySection(links: SiteLink[], section: string): SiteLink[] {
  return links.filter((l) => l.section === section);
}
