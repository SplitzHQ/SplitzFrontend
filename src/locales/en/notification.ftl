## Bell / panel
notification-title = Notifications
notification-open = Open notifications
notification-unread-count = { $count ->
    [one] { $count } unread notification
   *[other] { $count } unread notifications
}
notification-mark-all-read = Mark all read
notification-clear-all = Clear all
notification-dismiss = Dismiss
notification-empty-title = You're all caught up
notification-empty-hint = Activity from your groups will show up here.
notification-error = Could not load notifications.
notification-retry = Retry
notification-settings = Notification settings
notification-close = Close

## Requests
notification-requests-title = Requests
notification-requests-badge = { $count ->
    [one] { $count } pending request
   *[other] { $count } pending requests
}
notification-accept = Accept
notification-ignore = Ignore
notification-friend-request-title = Friend request
notification-friend-request-body = { $name } wants to be your friend.
notification-group-invite-title = Group invite
notification-group-invite-body = { $inviter } invited you to join { $group }.
notification-request-accepted = Accepted
notification-request-ignored = Ignored
notification-request-error = Something went wrong. Try again.
notification-friend-request-accepted-toast = You and { $name } are now friends
notification-group-invite-accepted-toast = You joined { $group }

## Activity messages
notification-friend-accepted-title = Friend request accepted
notification-friend-accepted-body = { $name } accepted your friend request.
notification-transaction-created-title = New expense in { $group }
notification-transaction-created-body = { $creator } added { $name } for { $amount }.
notification-related-transaction-created-title = You're in a new expense
notification-related-transaction-owe-body = { $creator } added { $name }. You owe { $amount }.
notification-related-transaction-lent-body = { $creator } added { $name }. You are owed { $amount }.
notification-invoice-created-title = New invoice in { $group }
notification-invoice-created-body = { $creator } created { $invoice }.
notification-related-invoice-created-title = You're on a new invoice
notification-related-invoice-created-body = { $creator } created { $invoice } in { $group }.
notification-settlement-recorded-title = Settlement recorded in { $group }
notification-settlement-recorded-body = { $recorder } recorded { $from } paid { $to } { $amount }.
notification-related-settlement-recorded-title = A payment involving you was recorded
notification-related-settlement-recorded-body = { $recorder } recorded { $from } paid { $to } { $amount } on { $invoice }.
notification-invoice-settled-title = Invoice settled in { $group }
notification-invoice-settled-body = { $invoice } is fully settled.
notification-related-invoice-settled-title = Your invoice is settled
notification-related-invoice-settled-body = { $invoice } in { $group } is fully settled.
notification-invoice-unnamed = Untitled invoice
notification-someone = Someone

## Settings page
notification-settings-title = Notifications
notification-settings-group-title = Group notifications
notification-settings-intro = Choose which activity you want to hear about. Friend requests and group invites are always delivered.
notification-settings-group-intro = Settings here override your global settings for { $group } only.
notification-settings-follow-global = Follows global setting
notification-settings-reset-group = Use global settings
notification-settings-reset-group-success = Group notifications now follow your global settings
notification-settings-saved = Saved
notification-settings-error = Could not save. Try again.
notification-settings-loading = Loading…

notification-settings-section-friends = Friends
notification-settings-section-transactions = Expenses
notification-settings-section-invoices = Invoices
notification-settings-section-settlements = Settlements
notification-settings-section-invoice-settled = Settled invoices

notification-type-FriendRequestAccepted = Friend request accepted
notification-type-FriendRequestAccepted-hint = When someone accepts your friend request
notification-type-TransactionCreated = Other expenses in my groups
notification-type-TransactionCreated-hint = Expenses you are not part of
notification-type-RelatedTransactionCreated = Expenses I'm part of
notification-type-RelatedTransactionCreated-hint = Expenses where you paid or owe something
notification-type-InvoiceCreated = Other invoices in my groups
notification-type-InvoiceCreated-hint = Invoices that do not include you
notification-type-RelatedInvoiceCreated = Invoices that include me
notification-type-RelatedInvoiceCreated-hint = Invoices where you owe or are owed
notification-type-SettlementRecorded = Other settlements in my groups
notification-type-SettlementRecorded-hint = Payments between other members
notification-type-RelatedSettlementRecorded = Settlements involving me
notification-type-RelatedSettlementRecorded-hint = Payments you made or received
notification-type-InvoiceSettled = Other invoices settled
notification-type-InvoiceSettled-hint = Invoices that do not include you
notification-type-RelatedInvoiceSettled = My invoices settled
notification-type-RelatedInvoiceSettled-hint = Invoices where you owed or were owed

## Group settings / invites
group-settings-title = Group settings
group-settings-invite = Invite friends
group-settings-invite-hint = Friends join after they accept
group-settings-notifications = Notifications
group-settings-notifications-hint = Choose what this group tells you about
group-invite-title = Invite friends
group-invite-empty = All your friends are already in this group.
group-invite-no-friends = Add friends from your profile first.
group-invite-pending = Invited
group-invite-submit = { $count ->
    [0] Send invites
    [one] Send { $count } invite
   *[other] Send { $count } invites
}
group-invite-success = { $count ->
    [one] Invite sent
   *[other] { $count } invites sent
}
group-invite-error = Could not send invites. Try again.
group-invite-pending-title = Waiting for a reply
