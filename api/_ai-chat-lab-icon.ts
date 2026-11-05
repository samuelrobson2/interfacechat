import { openai } from "@ai-sdk/openai";
import { generateImage } from "ai";
import { ICON_STYLE_REFERENCE_BASE64 } from "./_chat-lab-icon-style.js";
import { apiKeyMissing, configError, logAiError } from "./_shared.js";

// Chat Lab thread icons: a small 3D object for what each chat is about.
export const maxDuration = 60;

const ICON_MODEL = "gpt-image-1-mini";

const iconPrompt = (title: string) =>
  `Make a new 3D icon for this topic: "${title}". Match the attached reference
exactly in style only: isometric view, translucent frosted glass with bevelled
edges and soft refraction, a gradient through the glass from deep navy at the
bottom to dusky violet and lavender at the top, the same muted, moody lighting.
Do not copy the reference's object; design one simple, recognisable object for
the topic instead. Transparent background. No text, no letters, no numbers, no
people.`;

export async function POST(req: Request) {
  if (apiKeyMissing()) return configError();

  const { title }: { title?: string } = await req.json();
  const topic = title?.trim().slice(0, 200);
  if (!topic) {
    return new Response(JSON.stringify({ error: "title is required" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  try {
    const { image } = await generateImage({
      model: openai.image(ICON_MODEL),
      prompt: {
        text: iconPrompt(topic),
        images: [Buffer.from(ICON_STYLE_REFERENCE_BASE64, "base64")],
      },
      size: "1024x1024",
      providerOptions: {
        openai: {
          quality: "low",
          background: "transparent",
          outputFormat: "webp",
          outputCompression: 80,
        },
      },
    });

    return new Response(
      JSON.stringify({ image: `data:image/webp;base64,${image.base64}` }),
      { headers: { "content-type": "application/json" } },
    );
  } catch (error) {
    logAiError("chat-lab-icon", error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}
