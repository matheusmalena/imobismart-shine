

## Plan: Fix Cakto Webhook -- Payload Format Mismatch

### Root Cause

The webhook function is reading the wrong fields from the Cakto payload. Based on the official Cakto API documentation, the actual payload format is:

```text
{
  "data": {
    "id": "uuid-order-id",
    "customer": { "email": "...", "name": "..." },
    "product": { "name": "ImobiSmart Pro", "id": "uuid" },
    "offer": { "name": "ImobiSmart Pro", "id": "abc" },
    "amount": 49.90,
    "status": "paid",
    ...
  },
  "event": "purchase_approved",
  "secret": "ffc72047-12a3-470c-a086-e10b429ee530"
}
```

But the current code reads:
- `body.buyer?.email` -- WRONG, should be `body.data?.customer?.email`
- `body.product?.name` -- WRONG, should be `body.data?.product?.name`
- `body.transaction?.id` -- WRONG, should be `body.data?.id`
- Header `x-webhook-secret` -- WRONG, Cakto sends secret in the body as `body.secret`

### Three Critical Bugs

1. **Secret validation fails**: Code checks headers for the secret, but Cakto sends it in the JSON body (`body.secret`). This means every webhook call is rejected with 401 Unauthorized.

2. **Email not found**: Even if auth passed, `body.buyer?.email` is undefined because Cakto nests it under `body.data.customer.email`.

3. **Product name not found**: `body.product?.name` is undefined, so `plan` always resolves to `"free"` instead of the correct tier.

### Fix (single file change)

Update `supabase/functions/cakto-webhook/index.ts`:

- Read the secret from `body.secret` instead of request headers
- Extract email from `body.data?.customer?.email`
- Extract product/offer name from `body.data?.product?.name` or `body.data?.offer?.name`
- Extract amount from `body.data?.amount`
- Extract transaction ID from `body.data?.id`
- Add broader product name matching for "ImobiSmart" product names (e.g. "ImobiSmart Pro", "ImobiSmart Plus", "ImobiSmart -S..." for Starter)
- Keep all existing event handling logic and fallbacks intact

