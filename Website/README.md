# RushIn Technologies Website

Official static website project for RushIn Technologies.

## Tech Stack

- HTML5
- Tailwind CSS (CLI build)
- Vanilla JavaScript
- `http-server` for local static hosting

## Prerequisites

- Node.js 18+ (Node 22 works)
- npm

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Build/watch Tailwind CSS (in one terminal):

```bash
npm run dev
```

3. Serve the website locally (in another terminal):

```bash
npm run serve
```

4. Open in browser:

```text
http://localhost:8080
```

## Available Scripts

- `npm run dev`
	- Runs Tailwind CLI in watch mode.
	- Input: `src/input.css`
	- Output: `src/css/tailwind.css`

- `npm run serve`
	- Starts a static web server at port `8080` with no cache.

- `npm run images:fetch`
	- Runs `tools/fetch-images.js` to fetch/update image assets.

## Project Structure

```text
Website/
	index.html
	index_rushin.html
	about.html
	contact.html
	assets/
		css/
		js/
		images/
	src/
		input.css
		css/
			tailwind.css
```

## Notes

- If port `8080` is already in use, stop the existing process or run the server on a different port.
- Keep `npm run dev` running while editing styles so `src/css/tailwind.css` stays updated.

## License

MIT
