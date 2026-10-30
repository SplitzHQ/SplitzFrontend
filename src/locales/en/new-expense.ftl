new-expense-title = New expense
new-expense-frequency-one-time = One-time

new-expense-actions-skip = Skip
new-expense-actions-next = Next
new-expense-actions-done = Done

new-expense-pronoun-you = You

new-expense-sections-recent = Recent
new-expense-sections-groups = Groups
new-expense-sections-friends = Friends

new-expense-select-people-title = Select people or group
new-expense-select-people-with = With:
new-expense-select-people-search-placeholder = Search by name, @username, email, or phone

new-expense-split-title = Split options
new-expense-split-paid-by = Paid by { $username }
new-expense-split-types-equally = Equally
new-expense-split-types-percentage = Percentage
new-expense-split-types-shares = Shares
new-expense-split-types-adjustment = Adjustment
new-expense-split-types-custom = Exact amounts
new-expense-split-summary-total-amount = Total
new-expense-split-summary-included =
    { $count ->
        [one] Included ({ $count } person)
       *[other] Included ({ $count } people)
    }
new-expense-split-summary-not-included =
    { $count ->
        [one] Not included ({ $count } person)
       *[other] Not included ({ $count } people)
    }
new-expense-split-shares-count =
    { $count ->
        [one] { $count } share
       *[other] { $count } shares
    }
new-expense-split-validation-invalid-input = Amounts don't add up
new-expense-split-actions-complete = Continue

new-expense-review-title = Review expense
new-expense-review-expense-added-to = Adding to
new-expense-review-you-owe = You owe
new-expense-review-you-are-owed = You are owed
new-expense-review-actions-add-details = Add details
new-expense-review-button-name = Add a name
new-expense-review-button-category = Category
new-expense-review-button-location = Location
new-expense-review-button-receipt = Receipt
new-expense-review-fields-name-label = Category & name
new-expense-review-fields-name-placeholder = What was this for?
new-expense-review-fields-location = Location
new-expense-review-fields-location-placeholder = Enter a place or address
new-expense-review-fields-location-disclaimer = Using the location button sends your coordinates to OpenStreetMap Nominatim to look up the address.
new-expense-review-fields-receipt = Receipt photo
new-expense-review-fields-notes-label = Notes
new-expense-review-fields-notes-placeholder = Add a note…
new-expense-review-actions-done = Save
new-expense-review-actions-retry-receipt = Retry receipt upload
new-expense-review-error-saving-transaction = Couldn't save expense. Please try again.
new-expense-review-receipt-rate-limit = Too many uploads. Try again in { $seconds } seconds.
new-expense-review-error-receipt-not-image = Please choose an image file.
new-expense-review-error-receipt-too-large = Image must be under { $maxMb } MB.
new-expense-review-actions-select-category = Choose category
new-expense-review-category-search-placeholder = Search categories

new-expense-scan-button = Scan receipt
new-expense-scan-title = Scan a receipt
new-expense-scan-intro = Add one or more photos of the same receipt. We'll fill in the amount, currency, name, category, and date for you to review.
new-expense-scan-loading = Checking availability…
new-expense-scan-add-gallery = Gallery
new-expense-scan-add-camera = Camera
new-expense-scan-remove-image = Remove image
new-expense-scan-count = { $count } of { $max } photos
new-expense-scan-too-many = You can add up to { $max } photos.
new-expense-scan-recognize = Scan receipt
new-expense-scan-recognizing = Reading receipt…
new-expense-scan-applied = Details filled in from your receipt. Double-check before saving.
new-expense-scan-from-receipt = From receipt: { $name }
new-expense-scan-failed = Couldn't read the receipt. Try a clearer photo.
new-expense-scan-error = Something went wrong while reading the receipt. Try again.
new-expense-scan-rate-limit = Too many scans. Try again in { $seconds } seconds.
new-expense-scan-unavailable = Receipt scanning isn't set up yet. Add a model provider in your profile to use it.
new-expense-scan-unavailable-fixed = Receipt scanning isn't available on this server.
new-expense-scan-open-settings = Set up model provider
new-expense-scan-privacy = Photos are sent to the active model provider and saved with this expense.
