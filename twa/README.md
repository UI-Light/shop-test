# Android app (APK)

The shop is already installable as a normal PWA - open it in Chrome on Android
and use "Install app", or Share -> Add to Home Screen on iOS. Nothing in this
folder is needed for that.

This folder is only for building a **`.apk` file you can send someone**, so they
can install the shop without visiting a link.

## How it works

The APK does not contain the shop. It is a small Android shell (a *Trusted Web
Activity*) that opens the live site full screen, with no address bar. That is
deliberate:

- The shop uses Next.js Server Actions (`placeOrder`, `addToCart`, `signOut`),
  which only run on a real Next.js server. An APK that bundled the app would not
  be able to save an order.
- Because the APK loads the real site, the interface is exactly the website, and
  Google sign-in and the cart work without a single line of app-specific code.

The shop itself lives in the parent project. `manifest.json` here just says
which address to open and what to call the app.

## Build an APK

### Easiest - PWABuilder (no tools to install)

1. Push this folder and deploy the site first - the APK points at the live URL.
2. Go to <https://www.pwabuilder.com>, enter the site address and press Start.
3. Choose **Package for stores** -> **Android** -> **Download Package**.
4. You get a signed `.apk` you can email or share.

### Doing it yourself - Bubblewrap (needs Android Studio)

```bash
npx @bubblewrap/cli init          # reads manifest.json in this folder
npx @bubblewrap/cli build         # writes app-release.apk
```

## The step that makes the address bar disappear

This is the important one, and it is easy to miss.

A Trusted Web Activity only opens without an address bar if Chrome can **prove
the app and the website belong to the same owner**. That proof is a file the
website serves called `assetlinks.json`. If it is missing or wrong, Chrome
quietly falls back to showing a URL bar.

It must contain the fingerprint of the key that **signed the APK**, so build the
APK first, then work out the fingerprint:

```bash
keytool -printcert -jarfile app-release.apk
```

Copy the line that starts `SHA256:` and strip the colons. Then create
`public/.well-known/assetlinks.json` in the parent folder:

```json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "com.yourname.shop",
      "sha256_cert_fingerprints": ["PUT_THE_SHA256_FINGERPRINT_HERE"]
    }
  }
]
```

Push it, then check <https://digitalassetlinks.googleapis.com/v1/statements?source.web.site=https://shop-test-alpha-ten.vercel.app&relation=delegate_permission/common.handle_all_urls>
to confirm Google can read it.

The file is not committed here on purpose: it contains a fingerprint that is
only correct for your particular signed build, and writing a made-up one would
fail verification silently.

## Notes

- `packageId` in `manifest.json` is the app's permanent identity. Set it to
  something you own (`com.yourname.shop` is a placeholder) and keep it - changing
  it later means a different app.
- Signing keys (`*.jks`, `*.keystore`) are gitignored. Back the keystore up
  somewhere safe: losing it means you can never update an app you have already
  shared.
- If you rebuild and the APK starts showing a URL bar, the fingerprint has
  changed because the app was re-signed. Update `assetlinks.json` to match.