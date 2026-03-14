import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import config, { monolocale } from "$config";
import graph from "$graph/content";
import i18nit from "$i18n";

export async function getStaticPaths() {
	const guides = await getCollection("guide", guide => !guide.data.draft);

	return guides.map(guide => {
		let locale: string | undefined;
		let id: string;

		if (monolocale) {
			locale = undefined;
			id = guide.id;
		} else {
			const [language, ...ids] = guide.id.split("/");
			locale = config.i18n.defaultLocale === language ? undefined : language;
			id = ids.join("/");
		}

		return {
			params: { locale, id },
			props: {
				type: i18nit(locale || config.i18n.defaultLocale)(`navigation.guide`),
				title: guide.data.title,
				time: guide.data.timestamp.toISOString().split("T")[0].replace(/-/g, "/"),
				tags: guide.data.tags
			}
		};
	});
}

/**
 * GET handler that generates and returns the Open Graph image for a guide.
 */
export const GET: APIRoute = async ({ params, props }) => {
	const image = await graph({
		locale: params.locale || config.i18n.defaultLocale,
		type: props.type,
		site: config.title,
		author: config.author.name,
		title: props.title,
		time: props.time,
		tags: props.tags
	});

	return new Response(new Uint8Array(image), { headers: { "Content-Type": "image/png" } });
};