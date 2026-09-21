export default {
  content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}'
],
  theme: {
    extend: {
      screens: {
        // Below this is the mobile layout; this width and up is the regular
        // (desktop) layout. Drives the NavRail, type scale and card spacing.
        dt: '680px',
        // Where side columns move alongside the content instead of below it.
        // Later than `dt` because they need real width on top of a readable
        // content column: `wide` brings in the report's margin rail and the
        // review queue, `rail` the review flow's margin rail — later again,
        // since there the queue is already taking 280px.
        wide: '1024px',
        rail: '1180px',
      },
      colors: {
        base: '#131216',
        card: '#1B1A20',
        raised: '#23212A',
        line: '#302E38',
        txt: '#E9E6EC',
        muted: '#A5A1AE',
        faint: '#6E6A78',
        teal: {
          DEFAULT: '#55CFC4',
          hi: '#6FDDD3',
          fill: '#1E3B3A',
          ink: '#0D2B29',
        },
        tier: {
          t1: '#6E6A78',
          t2: '#E0A33E',
          t3: '#F0736F',
          blue: '#5B8DEF',
        },
        ok: '#5FC08D',
      },
      fontSize: {
        title: ['28px', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
        section: ['18px', { lineHeight: '1.35' }],
        body: ['16px', { lineHeight: '1.6' }],
        meta: ['14px', { lineHeight: '1.5' }],
        label: ['13px', { lineHeight: '1.4' }],
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
}
