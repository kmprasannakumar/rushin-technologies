module.exports = {
  content: [
    './**/*.html',
    './src/**/*.{js,ts,jsx,tsx}'
  ],
  // Safelist commonly-used utilities to avoid accidental purging during build
  safelist: [
    { pattern: /^text-/ },
    { pattern: /^bg-/ },
    { pattern: /^md:/ },
    { pattern: /^rounded/ },
    { pattern: /^p-/ },
    { pattern: /^pt-/ },
    { pattern: /^pb-/ },
    { pattern: /^px-/ },
    { pattern: /^py-/ },
    { pattern: /^grid/ },
    { pattern: /^max-w-/ },
    { pattern: /^border/ },
    { pattern: /^flex/ },
    { pattern: /^w-/ },
    { pattern: /^h-/ }
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
