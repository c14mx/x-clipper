export function extractXPostId(url: string): string {
	let parsed: URL;
	try {
		parsed = new URL(url);
	} catch {
		throw new Error(`Invalid URL: ${url}`);
	}

	const host = parsed.hostname.replace(/^www\./, "");
	if (host !== "x.com" && host !== "twitter.com") {
		throw new Error("Not a valid X URL. Please provide an x.com link.");
	}

	const match = parsed.pathname.match(/\/[^/]+\/status\/(\d+)/);
	if (!match || !match[1]) {
		throw new Error("Could not extract post ID from URL.");
	}

	return match[1];
}

const UNSAFE_CHARS = /[/\\:*?"<>|#^[\]]/g;
const TITLE_CHAR_LIMIT = 100;

export function generateFilename(authorName: string, text?: string, articleTitle?: string): string {
	const author = sanitize(authorName);

	// Prefer post text if available
	if (text && text.trim().length > 0) {
		const preview = text.trim().substring(0, TITLE_CHAR_LIMIT);
		return sanitize(`${author} on X - ${preview}`);
	}

	// Fall back to article title if no post text
	if (articleTitle && articleTitle.trim().length > 0) {
		return sanitize(`${author} on X - ${articleTitle}`);
	}

	return sanitize(`${author} on X - New Post`);
}

function sanitize(name: string): string {
	return name.replace(UNSAFE_CHARS, "").replace(/\s+/g, " ").trim() || "New X Post";
}

export function formatDate(date: Date | string): string {
	const d = typeof date === "string" ? new Date(date) : date;
	return d.toISOString().split("T")[0] ?? "";
}
