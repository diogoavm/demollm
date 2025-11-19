# The Museum — Modern Barbershop

Polished single-page experience for “The Museum” barbershop in Lisbon. Visitors can explore the story, browse curated services, and book an appointment directly from the hero page using an interactive calendar and slot picker.

## Highlights
- **Immersive hero**: serif headline, curated “today’s curation” card, and CTA that anchors to the booking panel.
- **Service-aware booking**: switch between Haircut (30 min) and Hair + Beard (60 min) durations to see the right availability.
- **Interactive calendar**: month navigation, weekday legend, automatic disabling of past dates, and responsive layout down to mobile.
- **Smart slot grid**: only shows future slots, prevents double-booking by persisting reservations in `localStorage`, and gives instant confirmation status.
- **Reservation summary**: lists the next five confirmed bookings so staff can verify the schedule at a glance.

## Getting Started

```bash
# 1. Install dependencies for linting/tests (optional but recommended)
python -m pip install -r requirements.txt

# 2. Serve the site locally (any static server works)
python -m http.server 8000

# 3. Visit the booking experience
open http://localhost:8000/index.html
```

> Tip: Opening `index.html` directly from disk also works because the scripts are loaded with `defer`, but running through a local server better mirrors production.

## Development Workflow

- Lint & format before committing:
  - `ruff check src tests`
  - `ruff format src tests`
- Run automated tests (extend as you add Python orchestration):
  - `python -m pytest`
- Smoke test the agents or orchestrators (if/when they exist):
  - `python -m demollm.app --config configs/dev.yaml`

## Customization Ideas

1. **Styling**: Adjust colors, gradients, or typography in `styles.css` for seasonal campaigns.
2. **Services**: Extend `services` in `app.js` to introduce premium rituals or VIP slots.
3. **Backend sync**: Replace the `localStorage` store with an API call to integrate with POS/CRM tooling.
4. **Content**: Update hero copy or “What’s included” list in `index.html` to match upcoming promotions.

## License

This project currently ships without an explicit license. Add one under `LICENSE` if you plan to distribute or open-source it.
