// Redirecting Supabase handlers to Firebase client implementation
// This ensures visual elements continue to build perfectly during transition.

import { 
  getCreatorsFb, 
  getArticlesFb, 
  getArticleBySlugFb, 
  updateCreatorDramaMeterFb, 
  addArticleFb, 
  addCreatorFb,
  getWhitelistedAdminsFb,
  addWhitelistedAdminFb,
  removeWhitelistedAdminFb,
  getNavLinksFb,
  saveNavLinksFb,
  getRotatingKeysFb,
  saveRotatingKeysFb,
  getNextActiveKeyFb,
  getTickerItemsFb,
  saveTickerItemsFb,
  NavLink
} from "./firebase";
import { Creator, Article } from "./mockData";

export const supabase = null; // Supabase disabled, running Firebase stack

export async function getCreators(): Promise<Creator[]> {
  return getCreatorsFb();
}

export async function getArticles(): Promise<Article[]> {
  return getArticlesFb();
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  return getArticleBySlugFb(slug);
}

export async function updateCreatorDramaMeter(id: string, dramaMeter: number): Promise<boolean> {
  return updateCreatorDramaMeterFb(id, dramaMeter);
}

export async function addArticle(article: Omit<Article, "id" | "publishedAt">): Promise<Article | null> {
  return addArticleFb(article);
}

export async function addCreator(creator: Omit<Creator, "id">): Promise<Creator | null> {
  return addCreatorFb(creator);
}

// Export admin whitelist functions
export async function getWhitelistedAdmins(): Promise<string[]> {
  return getWhitelistedAdminsFb();
}

export async function addWhitelistedAdmin(email: string): Promise<boolean> {
  return addWhitelistedAdminFb(email);
}

export async function removeWhitelistedAdmin(email: string): Promise<boolean> {
  return removeWhitelistedAdminFb(email);
}

// Export dynamic nav links functions
export async function getNavLinks(): Promise<NavLink[]> {
  return getNavLinksFb();
}

export async function saveNavLinks(links: NavLink[]): Promise<boolean> {
  return saveNavLinksFb(links);
}

// Export API rotation functions
export async function getRotatingKeys(): Promise<string[]> {
  return getRotatingKeysFb();
}

export async function saveRotatingKeys(keys: string[]): Promise<boolean> {
  return saveRotatingKeysFb(keys);
}

export async function getNextActiveKey(): Promise<string | null> {
  return getNextActiveKeyFb();
}

// Export Live Drama Tracker (ticker) functions
export async function getTickerItems(): Promise<string[]> {
  return getTickerItemsFb();
}

export async function saveTickerItems(items: string[]): Promise<boolean> {
  return saveTickerItemsFb(items);
}

