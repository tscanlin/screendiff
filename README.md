# picdiff

Picdiff is an image diffing tool, useful for screenshot diffing. It is very flexible, simple, and unopinionated. I tried to keep it simple so dependencies are at a minimum. HTML is rendered with strings and the main dependency is [node-resemble-js](#).

Features:

- Customizeable image diffing options and thresholds
- Generates a simple HTML preview with options to toggle views and see fullsize images
- Validates the json output from the diff to integrate into testing / ci workflows

- Doesn't take screenshots but provides helpers for [codecept.js](#) and [nightmare.js](#)
- Works similarly to jest snapshot diffs


## Usage

Install it

```bash
npm install -D picdiff
```

Then use it by adding to your package.json scripts

```json
{
  "picdiff:generate": "picdiff generate -c ./picdiff.config.js"
}
```

Picdiff expects a directory structure similar to the following:

```

```

```bash
```
```bash
```

[See tests for examples](#)


## Contributing

Contributions and suggestions are welcome! Please feel free to open an issue if you run into a problem or have a feature request. I'll do my best to respond in a timely fashion.

If you want to open a pull request just fork the repo but please make sure all tests and lint pass.


## License

[MIT]('http://opensource.org/licenses/MIT')
