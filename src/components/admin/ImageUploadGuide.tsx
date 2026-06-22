import React from "react";
import { HelpCircle, ExternalLink, AlertCircle } from "lucide-react";

export default function ImageUploadGuide() {
  return (
    <div className="glass-panel p-6 rounded-xl border border-zinc-800 shadow-2xl bg-zinc-950/40">
      <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2 mb-4">
        <HelpCircle className="text-[#FFD700] w-4 h-4" /> Image Upload & Hosting Guide
      </h2>
      
      <div className="space-y-4 text-xs text-zinc-300">
        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-300 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Important:</span> Raw image URLs must point directly to the actual image file, not a webpage.
          </div>
        </div>

        <p className="leading-relaxed">
          Since Cloudflare R2 environment variables are optional, you can easily host your article covers and creator avatars on free hosting platforms. Follow these steps:
        </p>

        <ol className="list-decimal list-inside space-y-2.5 font-mono text-[11px] text-zinc-400">
          <li>
            Go to a free hosting site:
            <div className="flex gap-2 mt-1.5 flex-wrap">
              <a 
                href="https://postimages.org/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-2 py-1 bg-zinc-900 border border-zinc-800 hover:border-[#FFD700]/30 hover:text-white rounded flex items-center gap-1 transition-all"
              >
                Postimages <ExternalLink className="w-3 h-3" />
              </a>
              <a 
                href="https://imgbb.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-2 py-1 bg-zinc-900 border border-zinc-800 hover:border-[#FFD700]/30 hover:text-white rounded flex items-center gap-1 transition-all"
              >
                ImgBB <ExternalLink className="w-3 h-3" />
              </a>
              <a 
                href="https://imgur.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-2 py-1 bg-zinc-900 border border-zinc-800 hover:border-[#FFD700]/30 hover:text-white rounded flex items-center gap-1 transition-all"
              >
                Imgur <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </li>
          <li>Upload your cover image or creator avatar.</li>
          <li>
            Locate the links and copy the <span className="text-[#FFD700] font-bold">&quot;Direct Link&quot;</span>.
            <div className="mt-1 text-[10px] text-zinc-500">
              💡 The correct link must end with a file extension, like <code className="text-zinc-300">.png</code>, <code className="text-zinc-300">.jpg</code>, <code className="text-zinc-300">.jpeg</code>, or <code className="text-zinc-300">.webp</code>.
            </div>
          </li>
          <li>Paste the copied Direct Link into the input field.</li>
          <li>Verify using the live thumbnail preview that appears below the field.</li>
        </ol>
      </div>
    </div>
  );
}
