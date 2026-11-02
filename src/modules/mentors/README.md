# Mentor module

Initial profile definitions are in `mentor-profiles.ts`. The profile list is a starting point and requires product-owner confirmation.

Before pilot use:
- Implement the Oscar API adapter against the confirmed provider contract.
- Implement authenticated session lifecycle.
- Enforce one active session per user atomically.
- Add timeout, provider failure, usage limit, and cost handling.
- Validate recommendation links and track relevant events.
