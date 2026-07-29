![The shroud](https://raw.githubusercontent.com/madil786110/Penelopes-Loom/loom/loom.svg)

Penelope told the suitors she would choose one of them when she finished weaving a burial shroud for Laertes. To delay them, she wove by day and secretly unravelled it by night, for three years.

This repository does the same thing, using git as the loom. The shroud lives on the `loom` branch, where a GitHub Action weaves rows into an SVG each morning. At night, it is force-reset back to empty. The weaving genuinely vanishes, faithfully. 

The record of the deception, however, survives on the `main` branch. 

See the [CHRONICLE.md](./CHRONICLE.md) to view the daily record of unravelled rows.

*(Note: GitHub proxies README images through camo, which caches them. The shroud above may lag behind reality by minutes to hours, so it is always slightly out of date.)*

## Run the Generator Locally

```bash
node loom.js --day 47 --rows 220 > loom.svg
```
