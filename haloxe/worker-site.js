// Serves the site on haloxe.com. The same files are published to hello-halo.cc,
// whose URLs every page declares as canonical.
export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    if (url.hostname === 'www.haloxe.com') {
      url.hostname = 'haloxe.com'
      return Response.redirect(url.toString(), 301)
    }
    return env.ASSETS.fetch(request)
  }
}
