# Living Park — website

The site for **Living Park**, at **livingpark.app**. Plain static files, no tracking.

```
index.html         the home page: the game's own living title garden, built from the
                   Living Park repo (see below), with the App Store button and the small print
support.html       Support page        (Apple requires a Support URL)
privacy.html       Privacy Policy      (Apple requires a Privacy Policy URL)
terms.html         Terms of Use / EULA
404.html           not-found page
sitemap.xml, robots.txt
CNAME              the custom domain (used by GitHub Pages; ignored elsewhere)
assets/pages.css   the look of the support, privacy and terms pages
assets/pages.js    their flower bed, the wandering bee and the cardinal on the title
assets/art/        the bee, the cardinal and the flowers, painted by the game itself
assets/*.js|css    the home page's game code (hashed names, from the build)
audio/, sounds/, fonts/, manifest.webmanifest   the game's own files, from the build
```

## Rebuilding the home page

The home page is Living Park itself, built in its site mode: only the title, with the
garden to play with (a tap plants a flower, a bench or a tree; a drag from the path makes
it longer), a bee and a cardinal, and flowers that grow behind the App Store button.

In the `living-park` repo:

```
npm run site
```

Then copy `dist-site/index.html`, `dist-site/assets/*`, `dist-site/audio`, `dist-site/sounds`,
`dist-site/fonts` and `dist-site/manifest.webmanifest` here, and remove the old hashed
`assets/index-*.js` files the new `index.html` no longer names.

When the game is on the App Store, set `APP_STORE_URL` in the game's `src/main.ts` and
rebuild: the button then says "Download on the App Store" and links there. Apple asks that
its own badge artwork is used for that link; swap it in from Apple's marketing tools then.

## Contact

contact@bluetomatostudio.com · Made by Farhan Hossain · a Blue Tomato Studio app
