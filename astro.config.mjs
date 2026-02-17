// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
	site: "https://alexisgomel.com",
	integrations: [
		mdx(),
		sitemap({
			filter: (page) => !page.includes('/font-test') && !page.includes('/webanalytics'),
		}),
	],
	adapter: cloudflare({
		platformProxy: {
			enabled: true,
		},
		routes: {
			extend: {
				exclude: [{ pattern: "/sitemap-index.xml" }, { pattern: "/sitemap-0.xml" }],
			},
		},
	}),
});
