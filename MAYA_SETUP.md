# Maya Checkout Setup

## Environment Variables
Add these to your environment (Vercel → Project → Settings → Environment Variables). Redeploy after saving.

- MAYA_PUBLIC_KEY = pk_sandbox_xxx (or live pk_...)
- MAYA_SECRET_KEY = sk_sandbox_xxx (or live sk_...)
- MAYA_ENV = sandbox (use 'production' for live)
- NEXT_PUBLIC_MAYA_ENABLED = 1 (set to 1 to show Maya tab; omit to hide)

For local dev, create `.env.local` in project root:

```
MAYA_PUBLIC_KEY=pk_sandbox_xxx
MAYA_SECRET_KEY=sk_sandbox_xxx
MAYA_ENV=sandbox
NEXT_PUBLIC_MAYA_ENABLED=1
```

## Flow
- User fills form → API creates Maya Checkout → user is redirected to `redirectUrl`.
- On success/failure/cancel, user returns to `/donate` with status query param.

## Testing
- Use Maya sandbox credentials and test cards from their docs.
- Minimum amount enforced: ₱50.

## Notes
- Currency is PHP.
- Personal data passed in buyer and metadata for reconciliation.
