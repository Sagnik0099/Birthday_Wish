BIRTHDAY WISHES V13 — FINAL SPACING UPDATE

Changes from V12:
- Removed the TURNING age text from the center of the birthday wheel (age still appears in the optional clock journey).
- Checked and gently separated the clock opening typography on short phones.
- Added a little more space between the wheel and the sender’s personal note.
- Renamed the note heading: FOR ALL THE SMILES STILL TO COME.

BIRTHDAY WISHES V12 — GITHUB PAGES
=================================

Upload all four files side by side in the repository root:
  index.html
  style.css
  app.js
  birthday-tune.mp3

Replace the V11 files as a complete set. No backend/build step is needed.

CREATOR
- Open the published base URL (without ?gift=1).
- Enter a recipient name and, optionally, their age.
- Optional NEW journey: choose Birth date and Celebration year.
  When a birth date is set, age is calculated as celebration year minus
  birth year (the age they'll turn on that birthday); manual age is disabled.
  The opening clock will show a graceful year timeline before the 100 wishes.
- Add an optional personal note that appears only at the end.
- Optionally set the email where replies should be received, click Activate
  wish inbox, and complete FormSubmit's one-time verification email.
- Click Copy link and send that personalized URL.

RECIPIENT
- The clock opening plays automatically and transitions into the original
  100 wish wheel. No entering controls or video recording/downloads.
- Audible autoplay depends on browser settings. A TAP DURING THE CLOCK
  OPENING now unlocks the song; it stays silent until the wheel begins.
  A tap anywhere on the wheel, or the visible 'Tap for music' control,
  is a fallback if automatic sound is blocked by the browser.
- Each wish is shown individually (~0.832 seconds each) and stays in the wheel.
- The sender's note and Make a wish are revealed only after all wishes.
  Make a wish is shown only if a sender email was included.
- Successful submission shows a warm, nontechnical acknowledgment.

PRIVACY / LIMITS
- Birth date and sender email are included in the recipient's URL, and
  anyone who has that URL can read them. Only share a birth date when
  the person is comfortable with it, or leave it blank and enter age only.
- No video is recorded or saved by this version.
- GitHub Pages is static. FormSubmit is the optional third-party service
  for wish replies; the provider, its availability, and successful delivery
  cannot be guaranteed by this webpage.
- A published MP3 recording should be used only if you have appropriate rights.


V17 — Original-project restoration + one birthday-letter chapter
-------------------------------------------------------------
This edition is based on the supplied Birthday(1).zip, NOT V16.
The clock, wheel, 100 wishes, music, fireworks, original short personal note,
Make a Wish dialog and reply inbox are preserved.

Sequence: clock -> 100 wishes -> handwritten letter -> original wheel with
original short message and Make a Wish (when a reply inbox is configured), plus
Read the Letter Again. The new buttons do not show before the wheel finishes.

The default letter is neutral/friendship-appropriate. To personalize it, use
'Handwritten birthday letter (optional)' in the editor before Copy link.
Leave it blank for the included letter; use {name} in custom text if desired.
The single-page letter does not scroll and uses fixed-layout word writing.
The original 'A personal note (optional)' stays separate and is still shown
with the wheel after the letter closes.

Static website: upload index.html, app.js, style.css and birthday-tune.mp3
to the repository root, and deploy through GitHub Pages.
