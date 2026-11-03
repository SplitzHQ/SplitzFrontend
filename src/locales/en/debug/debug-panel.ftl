# Debug panel (src/debug). Only dev builds and builds with VITE_SPLITZ_DEBUG_TOOLS=true load this file.

## Panel

debug-panel-title = Debug tools
debug-panel-toggle-tip = Debug tools (Ctrl+Shift+D)
debug-panel-hide = Hide
debug-panel-hide-tip = Hides the button and the strip until you reload. Press Ctrl+Shift+D to bring them back.
debug-panel-close = Close
debug-panel-search = Search tools…
debug-panel-search-label = Search debug tools
debug-panel-no-match = Nothing matches "{ $query }"
debug-panel-real = Real
debug-panel-real-tip = No simulation. The app behaves as it normally does.
debug-panel-changes = changes this browser's data
debug-panel-copied = Copied
debug-panel-copy-failed = Couldn't copy. The browser refused clipboard access.

## Strip of active simulations

debug-panel-simulating =
    { $count ->
        [one] Simulating
       *[other] Simulating { $count }
    }
debug-panel-sim-choice = { $sim }: { $choice }
debug-panel-undo = Undo
debug-panel-undo-sim = Undo { $sim }
debug-panel-undo-all = Undo all

## Pages

debug-panel-pages = Pages
debug-panel-pages-go = Go to
debug-panel-pages-go-tip = Opens a page in this tab. The value on the right is the current route.
debug-panel-page-home = Home
debug-panel-page-home-tip = Your groups and balances.
debug-panel-page-profile = Profile
debug-panel-page-profile-tip = Your account, friends and settings.
debug-panel-page-notifications = Notifications
debug-panel-page-notifications-tip = Notification settings for your account.
debug-panel-page-receipt = Receipt scanning
debug-panel-page-receipt-tip = Settings for reading receipts from photos.
debug-panel-page-2fa = 2FA setup
debug-panel-page-2fa-tip = The two-factor authentication setup page.
debug-panel-page-login = Log in
debug-panel-page-login-tip = The login page. It doesn't sign you out.

## Session

debug-panel-session = Session
debug-panel-user = Signed in as
debug-panel-user-tip = The user the app loaded from the server.
debug-panel-user-none = Nobody
debug-panel-user-copy-id = Copy user ID
debug-panel-user-copy-id-tip = Copies your user ID, for API calls or the database.
debug-panel-user-reload = Reload user
debug-panel-user-reload-tip = Fetches your user info, friends and balances again.
debug-panel-token = Access token
debug-panel-token-tip = The token that signs each API call. It refreshes itself when it expires.
debug-panel-token-none = None
debug-panel-token-expired = Expired
debug-panel-token-no-expiry = No expiry
debug-panel-token-minutes-left = { $count } min left
debug-panel-token-expire = Expire now
debug-panel-token-expire-tip = Marks the token as expired. The next API call refreshes it, so you can test the refresh.
debug-panel-token-sign-out = Sign out
debug-panel-token-sign-out-tip = Removes your tokens and opens the login page.

## Network

debug-panel-network = Network
debug-panel-api = API responses
debug-panel-api-tip = Fakes how the Splitz API answers. Other requests stay real.
debug-panel-api-slow = Slow
debug-panel-api-slow-tip = Each API call waits 2 seconds first. Look for loading states.
debug-panel-api-offline = Offline
debug-panel-api-offline-tip = Each API call fails as if there's no network.
debug-panel-api-server-error = Server error
debug-panel-api-server-error-tip = Each API call gets a 500 error.
debug-panel-api-rate-limit = Rate limited
debug-panel-api-rate-limit-tip = Each API call gets a 429 error with a 30 second wait. Look for the countdown.
debug-panel-cache = Cached data
debug-panel-cache-tip = Data the app keeps so pages open fast.
debug-panel-cache-count =
    { $count ->
        [one] { $count } query
       *[other] { $count } queries
    }
debug-panel-cache-refetch = Refetch all
debug-panel-cache-refetch-tip = Marks all cached data as old and loads what's on screen again.

## Language

debug-panel-language = Language
debug-panel-locale = App language
debug-panel-locale-tip = Shows the app in another language until you reload. Look for missing or long strings.
debug-panel-locale-en = English
debug-panel-locale-zh-cn = 简体中文
debug-panel-locale-choice-tip = Shows the app in this language until you reload.

## Browser failures

debug-panel-failures = Browser failures
debug-panel-storage-full = Storage full
debug-panel-storage-full-tip = Every write to local storage fails, as when the browser blocks site data. Logging in can't keep your tokens.
debug-panel-clipboard-denied = Clipboard denied
debug-panel-clipboard-denied-tip = The browser refuses to copy or paste, for example on invite links.

## Local data

debug-panel-data = Local data
debug-panel-data-local = This browser
debug-panel-data-local-tip = What this browser keeps for Splitz: tokens and settings.
debug-panel-data-clear = Clear and reload
debug-panel-data-clear-tip = Removes everything Splitz keeps in this browser, signs you out and reloads. The panel layout stays.
