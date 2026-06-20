// Redirecting Supabase handlers to Firebase client implementation
// This ensures visual elements continue to build perfectly during transition.

import { 
  getCreatorsFb, 
  getArticlesFb, 
  getArticleBySlugFb, 
  updateCreatorDramaMeterFb, 
  addArticleFb, 
  addCreatorFb 
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
