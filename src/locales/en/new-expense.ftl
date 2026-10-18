new-expense-title = New Expense
new-expense-frequency-one-time = One-time

new-expense-actions-skip = Skip
new-expense-actions-next = Next
new-expense-actions-done = Done

new-expense-pronoun-you = You

new-expense-sections-recent = Recent
new-expense-sections-groups = Groups
new-expense-sections-friends = Friends

new-expense-select-people-title = Select People / Group
new-expense-select-people-with = With:
new-expense-select-people-search-placeholder = Search by name, @username, email, phone

new-expense-split-title = Select Split Method
new-expense-split-paid-by = Paid By: { $username }
new-expense-split-types-equally = Equally
new-expense-split-types-percentage = Percentage
new-expense-split-types-shares = Shares
new-expense-split-types-adjustment = Adjustment
new-expense-split-types-custom = Custom
new-expense-split-summary-total-amount = Total Amount
new-expense-split-summary-included = Included ({ $count } people)
new-expense-split-summary-not-included = Not Included ({ $count } people)
new-expense-split-shares-count =
    { $count ->
        [one] { $count } share
       *[other] { $count } shares
    }
new-expense-split-validation-invalid-input = Invalid Input
new-expense-split-actions-complete = Complete

new-expense-review-title = Review & Complete
new-expense-review-expense-added-to = Expense added to
new-expense-review-you-owe = You owe
new-expense-review-you-are-owed = You are owed
new-expense-review-actions-add-details = Add Expense Details
new-expense-review-button-name = Give it a name
new-expense-review-button-category = Add Category
new-expense-review-button-location = Add Location
new-expense-review-button-receipt = Upload Receipt
new-expense-review-fields-name-label = Category and Name
new-expense-review-fields-name-placeholder = What's this for?
new-expense-review-fields-location = Location
new-expense-review-fields-location-placeholder = Search Location
new-expense-review-fields-location-disclaimer = If you click the button on the left, your location coordinates will be sent to OpenStreetMap Nominatim API to retrieve a human-readable address.
new-expense-review-fields-receipt = Image
new-expense-review-fields-notes-label = Notes
new-expense-review-fields-notes-placeholder = Anything else worth mentioning?
new-expense-review-actions-done = Save
new-expense-review-actions-retry-receipt = Retry receipt upload
new-expense-review-error-saving-transaction = Failed to save expense, please try again
new-expense-review-receipt-rate-limit = Too many uploads. Try again in { $seconds } seconds.
new-expense-review-error-receipt-not-image = Please select an image file
new-expense-review-error-receipt-too-large = Image must be smaller than { $maxMb }MB
new-expense-review-actions-select-category = Select Category
new-expense-review-category-search-placeholder = Search

new-expense-scan-button = Scan receipt
new-expense-scan-title = Scan a receipt
new-expense-scan-intro = Add one or more photos of the same receipt. The amount, currency, name, category and date are filled in for you to check.
new-expense-scan-loading = Checking availability…
new-expense-scan-add-gallery = Gallery
new-expense-scan-add-camera = Camera
new-expense-scan-remove-image = Remove image
new-expense-scan-count = { $count } of { $max } images
new-expense-scan-too-many = You can add up to { $max } images
new-expense-scan-recognize = Read receipt
new-expense-scan-recognizing = Reading receipt…
new-expense-scan-applied = Filled in from your receipt. Check the details before you continue.
new-expense-scan-from-receipt = From receipt: { $name }
new-expense-scan-failed = The receipt could not be read. Try a sharper photo.
new-expense-scan-error = Something went wrong while reading the receipt. Try again.
new-expense-scan-rate-limit = Too many scans. Try again in { $seconds } seconds.
new-expense-scan-unavailable = Receipt scanning is not set up yet. Add your own model provider in your profile to use it.
new-expense-scan-unavailable-fixed = Receipt scanning is not available on this server.
new-expense-scan-open-settings = Set up a model provider
new-expense-scan-privacy = Your photos are sent to the configured model provider and kept with this expense.
