// Tailwind 3 through PostCSS directly. @astrojs/tailwind only supports Astro
// 3-5, which is why installing used to need --legacy-peer-deps on Astro 6.
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
