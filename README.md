# Birthday Wishes V20 — Keepsake Edition

A static birthday surprise website: animated clock introduction, original 100-wish wheel, vintage envelope and handwriting letter, then the original special message with **Make a Wish** and **Read the Letter Again**.

## Publish with GitHub Pages

1. Extract the ZIP. Upload **index.html**, **style.css**, **app.js**, and **birthday-tune.mp3** to the **root** of your repository. Do not upload the ZIP itself as your website.
2. In **Settings → Pages**, use your chosen GitHub Pages publishing method. For branch publishing, choose `main` and `/(root)` and save.
3. When the deployment succeeds, open the published site and refresh fully (`Ctrl + Shift + R` on desktop). V20 uses updated CSS/JS cache versions.
4. Fill in the editor on the base URL, customize the name, optional special message, handwritten letter and signature; click **Copy link**. Send that personalized link to the recipient.

Older `?gift=1` / name / age / wishes / note / letter / from links remain supported. The original music file is unchanged.

## Story sequence

1. Original clock → original 100 wishes (same speed and order).
2. Dark burgundy backdrop fades in **after** the 100 wishes.
3. Closed envelope enters, rests, seal fades, and the top flap opens.
4. Folded letter slides out, becomes the actual parchment, and unfolds in two smooth stages.
5. Full text is laid out before writing starts. Individual characters reveal with opacity (not clipping), with a smaller illustrated hand holding a fountain pen.
6. Signature appears last. Long letters scroll gently; after writing finishes the letter returns to the beginning for reading.
7. **Turn the page** softly refolds the paper, returns it to the envelope, closes it, and sends the envelope toward **Read the Letter Again**.
8. The original wheel reappears without shrinking, with the original short special message plus **Make a Wish** and **Read the Letter Again**.

## Important details

- Your optional custom letter has a limit of 550 characters. A friendly default letter is provided when blank; no romance or heart imagery is used in the letter scene.
- **Make a Wish** stays visible even without a reply email. Without an inbox, the wish is a local, unsent moment; with a verified FormSubmit inbox, the recipient can send a reply. Live FormSubmit delivery depends on the service and email verification.
- Background music may need a visitor gesture depending on browser restrictions; use the music toggle if needed.
- The site uses Google Fonts and may fall back to local fonts when offline.
- If GitHub Pages reports **Deployment failed** after the site files build, check the Pages configuration, workflow status, and GitHub service status. A Pages deployment error does not automatically mean the page's JavaScript is broken.
- Reduced-motion preference skips the elaborate transitions and preserves the actual letter and both finale actions.

## V20 quality fixes compared with V19

- One ordered, cancelable animation sequence instead of conflicting class-based 3D animations.
- The paper stays completely hidden until extraction is complete; all transforms use a shared envelope/paper coordinate system.
- 2D top-flap opening avoids flipping/backface artifacts.
- The letter's full layout is created before writing, so appearing characters cannot reflow other words or be clipped mid-letter.
- No giant hand/finger imitation: a more recognizable small illustration of a hand gripping a fountain pen.
- No unwanted status text or top-right letter close icon.
- Completion keeps the original wheel's **scale at 1**. A small vertical translation opens real space for the note and buttons.
- The hidden canvas is not redrawn continuously during the letter, reducing phone CPU/GPU contention.

## Files

- `index.html` — website markup and letter scene
- `style.css` — original design plus coordinated story styling
- `app.js` — wheel, editing/sharing, the letter choreography and finale
- `birthday-tune.mp3` — the original audio, unchanged

### Manual live release check

On a real personalized GitHub Pages link, verify that the final wish completes, the closed envelope appears **before** the paper, the writing finishes, **Turn the page** returns to the original wheel, and both finale buttons work. Test once on your phone as well, particularly audio playback and optional email replies.
