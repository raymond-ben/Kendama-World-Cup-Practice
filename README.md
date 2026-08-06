# Kendama World Cup 2026 Practice App

A lightweight browser-based practice tool for the Kendama World Cup 2026. The app supports preliminary-round practice, finals practice, timed sessions, trick selection, level filtering, and score calculation.

## Live Site

[benraymond.me/kwc-practice](https://benraymond.me/kwc-practice/)

<p align="center">
  <img src="docs/KWCpracticeGIF.gif" alt="KWC Practice Demo" width="900">
</p>

## Features

- Search the complete trick list by trick name
- Filter tricks by one or more levels
- Practice preliminary rounds as two sets of five tricks
- Build finals practice sets of 10–30 tricks
- Run a three-minute timer
- Record landed tricks and calculate a final score
- Display full-marks bonuses when applicable
- Responsive layout for desktop and mobile browsers

## Trick List

The app includes 150 tricks across Levels 1–15.

- Levels 1–10 are available for preliminary practice.
- Levels 3–15 are available for finals practice.
- Each level contains ten tricks.

The trick data used by the app is stored in `data/tricks.json`. The accompanying spreadsheet is stored in `data/KWC26_Practice_App_Tricks_Final.xlsx`.

## Scoring

### Preliminary Practice

Each completed trick scores points equal to its level.

### Finals Practice

Each completed trick scores the square of its level:

```text
Finals points = level × level
```

Additional bonuses:

- Level 14 trick: +30 points
- Level 15 trick: +50 points
- Full marks: awarded when every selected trick is completed

## Running Locally

Because the app loads its trick data with JavaScript, open it through a local web server rather than opening `index.html` directly.

### VS Code Live Server

1. Open the project folder in VS Code.
2. Install the **Live Server** extension if needed.
3. Right-click `index.html`.
4. Select **Open with Live Server**.

### Python

From the project directory, run:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000` in your browser.

## Project Structure

```text
kwc-practice/
├── data/
│   ├── KWC26_Practice_App_Tricks_Final.xlsx
│   └── tricks.json
├── js/
│   ├── app.js
│   ├── data.js
│   └── ui.js
├── index.html
├── styles.css
├── CHANGELOG.md
└── README.md
```

## Deploying with GitHub Pages

This app is designed to work as a static GitHub Pages project. It can be hosted from its own repository or placed in a `/kwc-practice/` directory inside a personal-site repository.

After committing and pushing changes, verify that the published site contains the updated `data/tricks.json`. A hard refresh may be necessary if the browser has cached an older version.

## Version

Current release: **v1.1.0**

This release adds Levels 14 and 15 and moves the high-level finals bonuses to those levels.

## Disclaimer

This is an independent practice project and is not an official GLOKEN or Kendama World Cup application. Trick names and competition rules should be checked against the latest official event materials.
