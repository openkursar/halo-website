// Serves the site on haloxe.com. The same files are published to hello-halo.cc,
// whose URLs every page declares as canonical.
//
// Assets are served by exact path (html_handling "none"), so internal links that
// end in .html resolve without the platform's extension-stripping redirect. The
// directory behaviour of the primary host is reproduced here: /x/ serves
// /x/index.html and /x redirects to /x/.
export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    if (url.hostname === 'www.haloxe.com') {
      url.hostname = 'haloxe.com'
      return Response.redirect(url.toString(), 301)
    }

    const last = url.pathname.split('/').pop()
    if (last !== '' && last.includes('.')) return env.ASSETS.fetch(request)

    const index = new URL(url)
    index.pathname = `${url.pathname.replace(/\/$/, '')}/index.html`
    const response = await env.ASSETS.fetch(new Request(index, request))
    if (!response.ok) return env.ASSETS.fetch(request)
    if (last !== '') return Response.redirect(`${url.origin}${url.pathname}/${url.search}`, 301)
    return response
  }
}
