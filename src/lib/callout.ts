/**
 * Parse :::remark / :::note / :::tip / :::warning / :::caution blocks
 * and replace them with fenced code blocks for the MarkdownRenderer.
 *
 * Syntax:
 *
 *   :::remark
 *   Content here, supports **markdown**.
 *   :::
 *
 *   :::tip Custom Title
 *   Content here.
 *   :::
 *
 * Supported types: remark, note, tip, warning, caution
 * An optional title can follow the type on the same line.
 */

export interface CalloutConfig {
  type: string;
  title?: string;
  body: string;
}

const CALLOUT_TYPES = "remark|note|tip|warning|caution";
const CALLOUT_BLOCK_RE = new RegExp(
  `^:::(${CALLOUT_TYPES})(?:\\s+(.+?))?\\s*\\r?\\n([\\s\\S]*?)\\r?\\n:::\\s*$`,
  "gm"
);

export function preprocessCallouts(md: string): string {
  return md.replace(CALLOUT_BLOCK_RE, (_match, type: string, title: string | undefined, body: string) => {
    const config: CalloutConfig = {
      type: type.toLowerCase(),
      title: title?.trim() || undefined,
      body,
    };
    const json = JSON.stringify(config);
    return "```callout\n" + json + "\n```";
  });
}
