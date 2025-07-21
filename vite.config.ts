import react from "@vitejs/plugin-react-swc";
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig, type PluginOption } from "vite";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		react(),
		VitePWA({
			workbox: {
				/* Cache everything */
				globPatterns: ["**/*"],
				/* No filesize limit */
				maximumFileSizeToCacheInBytes: 0,
			},
			manifest: {
				name: "Realtime Todo App",
				short_name: "Todos",
				description: "A realtime, collaborative, offline ready todo app",
				icons: [
					{
						src: "/android-chrome-192x192.png",
						sizes: "192x192",
						type: "image/png",
					},
					{
						src: "/android-chrome-512x512.png",
						sizes: "512x512",
						type: "image/png",
						purpose: "maskable any",
					},
				],
				theme_color: "#11b3ac",
				background_color: "#11b3ac",
				display: "standalone",
			},
		}),
		visualizer() as PluginOption,
	],
	define: {
		global: "window",
	},
});
