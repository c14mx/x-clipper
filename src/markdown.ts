import type { XPost } from "./fetch-x-post";
import { formatDate } from "./utils";

export function generateMarkdown(post: XPost): string {
	const created = formatDate(post.created_at);
	const today = formatDate(new Date());
	const displayName = post.author.name;

	const hasArticle = !!post.article;

	let content = post.note_tweet?.text ?? post.text;
	const isOnlyTcoLink = /^https:\/\/t\.co\/\S+$/.test(content.trim());

	if (hasArticle && isOnlyTcoLink) content = "";

	const resolvedContent = content ? resolveUrls(content, post) : "";

	let md = `---
categories:
  - "[[Clippings]]"
author:
  - "[[${displayName}]]"
created: ${today}
published: ${created}
---
`;

	if (resolvedContent) md += `${resolvedContent}`;

	if (hasArticle) {
		const articleText = formatArticle(post);

		if (articleText) md += `\n### X Article\n\n${articleText}\n`;
	}

	return md;
}

function formatArticle(post: XPost): string | undefined {
	const article = post.article;
	if (!article) return undefined;

	const text = article.plain_text ?? article.preview_text;
	if (!text) return undefined;

	let resolved = text.replace(/\n/g, "\n\n");

	const mentions = article.entities?.mentions ?? [];
	for (const m of mentions) {
		resolved = resolved.replace(`@${m.username}`, `[@${m.username}](https://x.com/@${m.username})`);
	}

	const urls = article.entities?.urls ?? [];
	for (const u of urls) {
		const url = u.url;
		if (url.startsWith("http")) {
			const display = url.replace(/^https?:\/\//, "");
			resolved = resolved.replace(url, `[${display}](${url})`);
		} else {
			resolved = resolved.replace(url, `[${url}](https://${url})`);
		}
	}

	return resolved;
}

function resolveUrls(text: string, post: XPost): string {
	const urls = [
		...(post.note_tweet?.entities?.urls ?? []),
		...(post.entities?.urls ?? []),
	];

	let resolved = text;
	for (const u of urls) {
		const expanded = u.expanded_url ?? u.url;
		const display = u.display_url ?? expanded;

		if (expanded.includes("/status/") && expanded.includes(post.id)) continue;
		if (/x\.com\/i\/article\//.test(expanded)) continue;

		const markdown = `[${display}](${expanded})`;
		resolved = resolved.replace(u.url, markdown);
	}

	return resolved;
}
