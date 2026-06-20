export interface Creator {
  id: string;
  name: string;
  channelId: string;
  handle: string;
  avatarUrl: string;
  subscribers: number;
  category: "Vlogger" | "Gamer" | "Tech" | "Infotainment" | "Drama/Rant" | "Comedy";
  status: "Active" | "Hiatus" | "Drama/Exposed" | "Under Investigation";
  dramaMeter: number; // 0 to 100
  recentDramaTitle?: string;
  metrics: {
    monthlyViews: number;
    engagementRate: number; // percentage
  };
  bio: string;
  socials: {
    youtube: string;
    instagram?: string;
    twitter?: string;
  };
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  summary: string;
  content: string;
  coverImage: string;
  category: string;
  tags: string[];
  author: string;
  publishedAt: string;
  creatorId?: string; // linked YouTuber
  youtubeVideoId?: string; // embedded video if any
}

export const initialCreators: Creator[] = [
  {
    id: "creator-1",
    name: "Ducky Bhai",
    channelId: "UCJmrc_R7wR9f3K2FvSg3OQA",
    handle: "@duckybhai",
    avatarUrl: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=200",
    subscribers: 8450000,
    category: "Vlogger",
    status: "Active",
    dramaMeter: 45,
    recentDramaTitle: "Recent roast reaction and giveaway controversy",
    metrics: {
      monthlyViews: 45000000,
      engagementRate: 8.5,
    },
    bio: "Saad ur Rehman, known as Ducky Bhai, is one of Pakistan's biggest lifestyle vloggers and commentators. Known for his humor, lavish lifestyle videos, and early career roasts.",
    socials: {
      youtube: "https://youtube.com/c/duckybhai",
      instagram: "https://instagram.com/duckybhai",
    }
  },
  {
    id: "creator-2",
    name: "Raza Samo",
    channelId: "UCwKz2Z80kQfW6XoW3c15-Lg",
    handle: "@razasamo",
    avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200",
    subscribers: 2100000,
    category: "Drama/Rant",
    status: "Drama/Exposed",
    dramaMeter: 85,
    recentDramaTitle: "Leaked response video and clashes with podcast hosts",
    metrics: {
      monthlyViews: 8500000,
      engagementRate: 12.4,
    },
    bio: "Raza Samo is a veteran commentator, roasted content creator, and former lead of Khujlee Family. Known for his raw analysis of Pakistani YouTube dynamics.",
    socials: {
      youtube: "https://youtube.com/c/razasamo",
      twitter: "https://twitter.com/razasamo",
    }
  },
  {
    id: "creator-3",
    name: "Mooroo",
    channelId: "UC_w1L58WJvE1sL2rSg4eL0g",
    handle: "@mooroomusic",
    avatarUrl: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=200",
    subscribers: 1150000,
    category: "Infotainment",
    status: "Active",
    dramaMeter: 5,
    metrics: {
      monthlyViews: 2000000,
      engagementRate: 9.8,
    },
    bio: "Taimoor Salahuddin, famously known as Mooroo, is a pioneer in cinematic vlogging, music production, and high-quality podcast content in Pakistan.",
    socials: {
      youtube: "https://youtube.com/c/mooroomusic",
      instagram: "https://instagram.com/mooroo",
    }
  },
  {
    id: "creator-4",
    name: "Irfan Junejo",
    channelId: "UCm9tJqgQ0M_wE2H-l-9Q-2g",
    handle: "@irfanjunejo",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
    subscribers: 1600000,
    category: "Vlogger",
    status: "Active",
    dramaMeter: 12,
    recentDramaTitle: "Sudden break explanation vlog",
    metrics: {
      monthlyViews: 3500000,
      engagementRate: 11.2,
    },
    bio: "Irfan Junejo is a celebrated storyteller and filmmaker who changed the landscape of vlogging in Pakistan with his signature style and visual techniques.",
    socials: {
      youtube: "https://youtube.com/c/irfanjunejo",
      twitter: "https://twitter.com/irfanjunejo",
    }
  },
  {
    id: "creator-5",
    name: "Maaz Safder",
    channelId: "UC-5e9Ld-zXWswT2fVl_V2dA",
    handle: "@maazsafder",
    avatarUrl: "https://images.unsplash.com/photo-1628157582853-a796fa650a6a?auto=format&fit=crop&q=80&w=200",
    subscribers: 4200000,
    category: "Vlogger",
    status: "Hiatus",
    dramaMeter: 30,
    recentDramaTitle: "Family business expansion rumours",
    metrics: {
      monthlyViews: 25000000,
      engagementRate: 6.1,
    },
    bio: "Maaz Safder is a record-breaking daily vlogger from Karachi who rose to fame with his consistent family vlogs and business ventures.",
    socials: {
      youtube: "https://youtube.com/c/maazsafder",
    }
  }
];

export const initialArticles: Article[] = [
  {
    id: "art-1",
    slug: "raza-samo-breaks-silence-on-podcast-clash",
    title: "Raza Samo Breaks Silence on Podcast Controversy: The Raw Truth Explored",
    summary: "In a dramatic 20-minute response video, Raza Samo addresses the recent podcast fallout, revealing behind-the-scenes negotiations and personal clashes that led to the incident.",
    content: `<p>The Pakistani YouTube community is currently experiencing one of its biggest controversies of the year. Raza Samo, a prominent commentator and video creator, has officially broken his silence regarding the recent fallout on a popular podcast network.</p>

<h3>The Origin of the Clash</h3>
<p>According to Samo, the disagreement started during pre-interview preparations when the hosts allegedly attempted to push an unauthorized narrative. Samo stated, "I expected a professional dialogue, but what transpired was a targeted effort to sensationalize old personal disputes for temporary views."</p>

<h3>Reactions Across the Community</h3>
<p>Several other YouTubers have weighed in on the issue. While some call for moderation, others suggest that podcast culture in Pakistan is becoming increasingly exploitative. The engagement metrics show a massive spike in searches, particularly across major Pakistani urban centers.</p>

<p>Stay tuned as we track this story and monitor potential responses from the podcast hosts.</p>`,
    coverImage: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&q=80&w=600",
    category: "Controversies",
    tags: ["Raza Samo", "Pakistani YouTube", "Drama", "Podcasts"],
    author: "Mitti Fied News",
    publishedAt: "2026-06-20T10:00:00Z",
    creatorId: "creator-2"
  },
  {
    id: "art-2",
    slug: "ducky-bhai-hits-new-subscriber-milestone",
    title: "Ducky Bhai Hits 8.4 Million Subscribers Amid Lifestyle Vlog Pivot",
    summary: "Ducky Bhai solidifies his position as Pakistan's leading individual YouTuber, reaching a massive milestone after transitioning fully to luxury family vlogs.",
    content: `<p>Saad ur Rehman, popularly known as Ducky Bhai, has achieved another historic milestone, crossing 8.4 million subscribers on YouTube. This achievement comes after a highly successful year of shifting content strategies from traditional roast commentary to luxury family vlogging.</p>

<h3>A Strategy of Consistency</h3>
<p>Ducky's rise is driven by daily uploads and high-quality production, showcasing international travels, family interactions, and high-value giveaways. His recent videos average over 2 million views within 24 hours of release, making him a primary target for major brand integrations in Pakistan.</p>

<h3>What lies ahead?</h3>
<p>Industry insiders expect Ducky Bhai to hit the 10 million subscriber diamond play button milestone by early next year if his current growth trajectory continues.</p>`,
    coverImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=600",
    category: "Milestones",
    tags: ["Ducky Bhai", "Subscribers", "Vlogging"],
    author: "Mitti Fied Editor",
    publishedAt: "2026-06-19T14:30:00Z",
    creatorId: "creator-1"
  },
  {
    id: "art-3",
    slug: "is-pakistani-cinema-vlogging-dying",
    title: "Is Pakistani Cinematic Vlogging Dying? Analyzing Mooroo & Junejo's Shift",
    summary: "With creators like Mooroo focusing more on podcasts and Irfan Junejo taking frequent breaks, we analyze the shifting trends in high-effort cinematic vlogging.",
    content: `<p>A few years ago, cinematic vlogging was the gold standard of Pakistani YouTube. Creators like Irfan Junejo and Mooroo inspired thousands of amateur filmmakers with beautiful color grading, carefully picked soundscapes, and tight storytelling. Today, however, the landscape looks drastically different.</p>

<h3>The Economics of Vlogging</h3>
<p>High-effort cinematic videos require days of editing and planning, yet YouTube's current algorithm heavily favors long-form daily content and sensationalized titles. As Mooroo transitions to podcasting and Irfan Junejo adopts a more relaxed uploading schedule, the era of visual vlogs seems to be transforming into casual audio-visual formats.</p>

<h3>Future Outlook</h3>
<p>Is this the end of cinematic storytelling on the platform? Or simply a maturation of the medium where long-form podcasts offer deeper intellectual engagement? Only time will tell.</p>`,
    coverImage: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&q=80&w=600",
    category: "Analysis",
    tags: ["Mooroo", "Irfan Junejo", "Vlogging", "Cinematic"],
    author: "Mitti Fied Critic",
    publishedAt: "2026-06-18T08:15:00Z",
    creatorId: "creator-3",
    youtubeVideoId: "dQw4w9WgXcQ"
  }
];
