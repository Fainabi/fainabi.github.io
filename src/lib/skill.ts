/**
 * Parse :::skill blocks and replace them with fenced code blocks that the
 * MarkdownRenderer can intercept.
 *
 * Syntax:
 *
 *   :::skill
 *   Skill description in markdown.
 *   :::
 *
 *   :::skill Optional Title
 *   Skill description in markdown.
 *   :::
 */

export interface SkillConfig {
  title?: string;
  body: string;
}

const SKILL_BLOCK_RE = /^:::skill(?:\s+(.+?))?\s*\r?\n([\s\S]*?)\r?\n:::\s*$/gm;

export function preprocessSkills(md: string): string {
  return md.replace(SKILL_BLOCK_RE, (_match, title: string | undefined, body: string) => {
    const config: SkillConfig = {
      title: title?.trim() || undefined,
      body,
    };
    const json = JSON.stringify(config);
    return "```skill\n" + json + "\n```";
  });
}
