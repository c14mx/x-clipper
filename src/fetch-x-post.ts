import { requestUrl } from "obsidian";

const BASE_URL = "https://api.x.com/2/tweets";

export interface XPost {
	id: string;
	text: string;
	created_at: string;
	note_tweet?: XNoteTweet;
	article?: XArticle;
	entities?: XEntity;
	author: XUser;
}

interface ApiResponse {
	data?: {
		id: string;
		text: string;
		created_at: string;
		note_tweet?: XNoteTweet;
		article?: XArticle;
		entities?: XEntity;
	};
	includes?: {
		users?: XUser[];
	};
	errors?: XError[];
}

export interface XNoteTweet {
	text: string;
	entities?: XEntity;
}

export interface XArticle {
	title: string;
	plain_text?: string;
	preview_text?: string;
	entities?: XEntity;
}

export interface XEntity {
	urls?: XUrl[];
	mentions?: XMention[];
}

export interface XUser {
	id: string;
	name: string;
	username: string;
}

export interface XUrl {
	start: number;
	end: number;
	url: string;
	expanded_url: string;
	display_url: string;
	title?: string;
	description?: string;
	unwound_url?: string;
}

export interface XMention {
	start: number;
	end: number;
	username: string;
}

export interface XError {
	type: string;
	message: string;
}

export async function fetchXPost(id: string, bearerToken: string): Promise<XPost> {
	const params = new URLSearchParams({
		"tweet.fields": "created_at,note_tweet,entities,attachments,article",
		expansions: "author_id,attachments.media_keys",
		"user.fields": "name,username",
	});

	const url = `${BASE_URL}/${id}?${params}`;

	const res = await requestUrl({
		url,
		method: "GET",
		headers: { Authorization: `Bearer ${bearerToken}` },
		throw: false,
	});

	if (res.status === 401 || res.status === 403) {
		throw new Error(`Authentication failed (${res.status}). Check your Bearer Token in settings.`);
	}
	if (res.status === 404) {
		throw new Error(`Post not found: ${id}`);
	}
	if (res.status === 429) {
		throw new Error("Rate limited by X API. Try again later.");
	}
	if (res.status < 200 || res.status >= 300) {
		throw new Error(`X API error: ${res.status}`);
	}

	const json = res.json as ApiResponse;

	if (!json.data) {
		const msg = json.errors?.[0]?.message ?? "Unknown error";
		throw new Error(`X API returned no data: ${msg}`);
	}

	const author = json.includes?.users?.[0];
	if (!author) {
		throw new Error("Could not resolve post author.");
	}

	return { ...json.data, author };
}
