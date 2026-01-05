// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import partytown from "@astrojs/partytown";

import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
	site: "https://alexisgomel.com",
	integrations: [
		mdx(),
		sitemap({
			filter: (page) => !page.includes('/font-test'),
		}),
		partytown({
			config: {
				forward: ["dataLayer.push"],
			},
		}),
	],
	adapter: cloudflare({
		platformProxy: {
			enabled: true,
		},
	}),
});
