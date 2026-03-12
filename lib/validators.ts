export type ChannelInputType = "handle" | "channelId" | "url" | "text";

export interface ParsedChannelInput {
  type: ChannelInputType;
  value: string;
}

export function parseChannelInput(input: string): ParsedChannelInput {
  const trimmed = input.trim();

  // @handle format
  if (trimmed.startsWith("@")) {
    return { type: "handle", value: trimmed };
  }

  // Channel ID format (starts with UC and is 24 chars)
  if (/^UC[\w-]{22}$/.test(trimmed)) {
    return { type: "channelId", value: trimmed };
  }

  // URL formats
  try {
    const url = new URL(
      trimmed.startsWith("http") ? trimmed : `https://${trimmed}`
    );
    if (
      url.hostname === "youtube.com" ||
      url.hostname === "www.youtube.com" ||
      url.hostname === "m.youtube.com"
    ) {
      const path = url.pathname;

      // /channel/UCxxxx
      const channelMatch = path.match(/\/channel\/(UC[\w-]{22})/);
      if (channelMatch) {
        return { type: "channelId", value: channelMatch[1] };
      }

      // /@handle
      const handleMatch = path.match(/\/@([\w.-]+)/);
      if (handleMatch) {
        return { type: "handle", value: `@${handleMatch[1]}` };
      }

      // /c/customname or /user/username → handle として解決
      const customMatch = path.match(/\/(c|user)\/([\w.-]+)/);
      if (customMatch) {
        return { type: "handle", value: `@${customMatch[2]}` };
      }
    }
  } catch {
    // Not a valid URL, fall through to text
  }

  // Plain text (search fallback)
  return { type: "text", value: trimmed };
}

export function validateAnalysisRequest(body: unknown): {
  valid: boolean;
  error?: string;
  data?: { channelInput: string; brandName: string; brandDescription?: string };
} {
  if (!body || typeof body !== "object") {
    return { valid: false, error: "リクエストボディが不正です" };
  }

  const { channelInput, brandName, brandDescription } = body as Record<
    string,
    unknown
  >;

  if (!channelInput || typeof channelInput !== "string" || !channelInput.trim()) {
    return { valid: false, error: "チャンネル入力は必須です" };
  }

  if (!brandName || typeof brandName !== "string" || !brandName.trim()) {
    return { valid: false, error: "ブランド名は必須です" };
  }

  return {
    valid: true,
    data: {
      channelInput: channelInput.trim(),
      brandName: brandName.trim(),
      brandDescription:
        typeof brandDescription === "string" ? brandDescription.trim() || undefined : undefined,
    },
  };
}
