/* Site settings — the only file you need to edit to wire up the contact form.
 *
 * CONTACT FORM
 * By default the form opens the visitor's email app (mailto). That fails for
 * anyone without a mail app set up, so connect a free form service instead:
 *
 *   Option A — Formspree (https://formspree.io)
 *     1. Create a form that sends to hello@drizoeditz.pro.
 *     2. Paste its endpoint below, e.g. 'https://formspree.io/f/abcdwxyz'.
 *
 *   Option B — Web3Forms (https://web3forms.com)
 *     1. Get a free access key for hello@drizoeditz.pro.
 *     2. Set formEndpoint to 'https://api.web3forms.com/submit'
 *        and paste the key into formAccessKey.
 *
 * Leave formEndpoint empty to keep the email-app fallback.
 */
window.SITE_CONFIG = {
  email: 'hello@drizoeditz.pro',
  whatsapp: '4917688649232',   // digits only, with country code
  formEndpoint: '',
  formAccessKey: '',
  /* HERO SHOWREEL — Stage 1. Leave src empty until Driss supplies a clip.
   * When set, the hero arch shows this muted looping clip instead of the
   * profile photo (30-60s, compressed, under ~6 MB). poster is shown on
   * reduced-motion / data-saver, and as the video poster. */
  showreel: { src: '', poster: '' },
  /* BOOKING — Stage 2. Leave empty until Driss supplies a Cal.com or
   * Calendly link. While empty, both "Book a 15-min call" buttons stay
   * hidden. Plain link, no embed. */
  bookingUrl: '',
  /* LEAD MAGNET — Stage 2. Leave both empty until configured. While
   * either is empty, the "10 reel hooks that work" signup stays
   * completely hidden. leadFormEndpoint uses the same form-service
   * pattern as formEndpoint above; leadPdfUrl is the PDF to show
   * after signup. */
  leadFormEndpoint: '',
  leadPdfUrl: '',
  /* ANALYTICS — Stage 3. Cookie-free (Plausible-style), OFF by default.
   * To turn it on: set enabled to true, domain to 'drizoeditz.pro', and
   * scriptUrl to your Plausible script URL, e.g.
   * 'https://plausible.io/js/script.js'. No cookie banner needed.
   * analytics.js tracks clicks on WhatsApp, email, Hire me, quote buttons
   * and form submits (elements with data-track) only when enabled. */
  analytics: { enabled: false, domain: '', scriptUrl: '' },
  /* EXTRA PROFILES — Stage 3. Fill in only the profiles Driss has.
   * Empty ones are never shown. Use full URLs, e.g.
   * youtube: 'https://www.youtube.com/@charliespokecards' */
  socials: { youtube: '', tiktok: '', behance: '', vimeo: '' },
  /* ABOUT PHOTO — Stage 3. Leave empty to keep profile.jpg. Set a file
   * name (e.g. 'about-photo.jpg') to use a different photo in About. */
  aboutPhoto: '',
  /* TRIAL PAYMENT. Leave empty until Driss supplies his PayPal payment
   * link for the $10 trial edit (e.g. a PayPal payment link). While
   * empty, the PayPal button on trial.html stays hidden and the page
   * says the link will be sent after the brief is reviewed.
   * AUTO-RETURN URL (paste into PayPal, Confirmation step):
   * https://drizoeditz.pro/payment-success.html — customers return
   * there after a successful checkout. */
  trialPaypalUrl: 'https://www.paypal.com/ncp/payment/XK46NBVW36AFS'
};
