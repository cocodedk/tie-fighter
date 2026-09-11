const base = 'https://cocodedk.github.io/tie-fighter/';
const repository = 'https://github.com/cocodedk/tie-fighter';
const locales = {
  en: {
    title: 'TIE Fighter game: low-poly space combat in your browser',
    description: 'Play the TIE Fighter game in your browser. Fly a low-poly ship, shoot X-wings, and defend your sector with keyboard or touch controls. Launch your fighter.',
    locale: 'en_US', alternate: 'fa_IR',
    alt: 'TIE Fighter game title beside a low-poly TIE fighter flying through a starfield.',
    keywords: 'primary: TIE Fighter game; secondary: low-poly space shooter, browser space game; intent: play',
  },
  fa: {
    title: 'بازی تای فایتر: نبرد فضایی سه‌بعدی در مرورگر | Cocode',
    description: 'بازی تای فایتر را در مرورگر اجرا کن. با جنگنده‌ای سه‌بعدی و کم‌پلی‌گان به ایکس‌وینگ‌ها شلیک کن و با صفحه‌کلید یا کنترل لمسی از این بخش دفاع کن. آمادهٔ پروازی؟',
    locale: 'fa_IR', alternate: 'en_US',
    alt: 'عنوان بازی تای فایتر کنار جنگندهٔ کم‌پلی‌گان در میان ستاره‌ها.',
    keywords: 'primary: بازی تای فایتر; secondary: بازی فضایی کم‌پلی‌گان، بازی تیراندازی در مرورگر; intent: play',
  },
};

export default function siteMetadata() {
  return {
    name: 'site-metadata',
    transformIndexHtml(html, context) {
      const language = /(?:^|\/)fa(?:\/|$)/.test(context.path) ? 'fa' : 'en';
      const copy = locales[language];
      const url = `${base}${language === 'fa' ? 'fa/' : ''}`;
      const meta = (key, content, property = false) => ({
        tag: 'meta', attrs: { [property ? 'property' : 'name']: key, content }, injectTo: 'head',
      });
      const graph = {
        type: 'website', site_name: 'TIE Fighter', title: copy.title,
        description: copy.description, url, image: `${base}og.png`,
        'image:width': '1200', 'image:height': '630', 'image:alt': copy.alt,
        locale: copy.locale, 'locale:alternate': copy.alternate,
      };
      const twitter = {
        card: 'summary_large_image', title: copy.title, description: copy.description,
        image: `${base}og.png`, 'image:alt': copy.alt,
      };
      const schema = {
        '@context': 'https://schema.org', '@type': 'VideoGame',
        name: 'TIE Fighter', description: copy.description, url,
        inLanguage: language, applicationCategory: 'GameApplication',
        operatingSystem: 'Any operating system with a WebGL2-capable browser',
        gamePlatform: 'Web browser', genre: 'Space shooter', playMode: 'SinglePlayer',
        isAccessibleForFree: true, image: `${base}og.png`,
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        author: {
          '@type': 'Person', name: 'Babak Bandpey', url: 'https://cocode.dk',
          sameAs: ['https://linkedin.com/in/babakbandpey', 'https://github.com/cocodedk'],
        },
        publisher: { '@type': 'Organization', name: 'Cocode', url: 'https://cocode.dk' },
        license: `${repository}/blob/main/LICENSE`,
        subjectOf: { '@type': 'SoftwareSourceCode', codeRepository: repository },
      };
      const cleaned = html.replace(/<title\b[^>]*>[\s\S]*?<\/title>/gi, '')
        .replace(/<meta\b[^>]*\bname\s*=\s*["']description["'][^>]*>/gi, '');
      return {
        html: cleaned.replace(/<head\b[^>]*>/i, `$&\n<!-- SEO keywords: ${copy.keywords} -->`),
        tags: [
          { tag: 'title', children: copy.title, injectTo: 'head' },
          {
            tag: 'link', injectTo: 'head',
            attrs: {
              rel: 'preload', as: 'font', type: 'font/woff2', crossorigin: 'anonymous',
              href: language === 'fa' ? '../fonts/vazirmatn-variable-arabic.woff2' : './fonts/barlow-condensed-700-latin.woff2',
            },
          },
          meta('description', copy.description), meta('robots', 'index, follow'),
          { tag: 'link', attrs: { rel: 'canonical', href: url }, injectTo: 'head' },
          ...[['en', base], ['fa', `${base}fa/`], ['x-default', base]].map(([hreflang, href]) => ({
            tag: 'link', attrs: { rel: 'alternate', hreflang, href }, injectTo: 'head',
          })),
          ...Object.entries(graph).map(([key, value]) => meta(`og:${key}`, value, true)),
          ...Object.entries(twitter).map(([key, value]) => meta(`twitter:${key}`, value)),
          { tag: 'script', attrs: { type: 'application/ld+json' }, children: JSON.stringify(schema), injectTo: 'head' },
        ],
      };
    },
  };
}
