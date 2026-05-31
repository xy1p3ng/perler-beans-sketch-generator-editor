export const STYLE_OPTIONS = [
  { id: 'cartoon', label: '卡通', prompt: 'cartoon style, bold outlines, flat colors, simple shapes' },
  { id: 'pixel', label: '像素', prompt: 'pixel art style, 8-bit aesthetic, blocky shapes' },
  { id: 'minimalist', label: '简约', prompt: 'minimalist flat design, simple geometric shapes, very few colors' },
  { id: 'cute', label: '可爱', prompt: 'kawaii cute style, rounded shapes, soft colors' },
  { id: 'retro', label: '复古', prompt: 'retro 8-bit game style, limited palette, nostalgic' },
] as const;

export type StyleId = typeof STYLE_OPTIONS[number]['id'];

const PERLER_BEAD_CONTEXT = `You are an image generator for a perler bead (fuse bead) pattern design tool. Generate an image that is:
- Simple and clear with well-defined edges
- Uses flat colors with minimal gradients
- Has a limited color palette (max 16-32 distinct colors)
- Has no tiny details that can't be represented in 5mm beads
- Suitable for conversion to a pixel grid pattern`;

export function buildPrompt(userDescription: string, styleId: StyleId = 'cartoon'): string {
  const style = STYLE_OPTIONS.find(s => s.id === styleId);
  const stylePrompt = style?.prompt || STYLE_OPTIONS[0].prompt;
  return `${userDescription}, ${stylePrompt}, limited color palette, clean edges, flat colors, suitable for perler bead / fuse bead crafting, no tiny details`;
}

export function buildSystemPrompt(): string {
  return PERLER_BEAD_CONTEXT;
}
