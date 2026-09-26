export default function handler(_req, res) {
  res.status(404)
    .setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("X-Robots-Tag", "noindex");
  res.send(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="robots" content="noindex">
    <title>Page not found | Environment Warrior</title>
  </head>
  <body>
    <main>
      <h1>Page not found</h1>
      <p>The page you requested does not exist.</p>
      <p><a href="/">Return to Environment Warrior</a></p>
    </main>
  </body>
</html>`);
}
