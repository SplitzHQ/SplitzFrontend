## Bell / panel
notification-title = Notifications
notification-open = Open notifications
notification-unread-count =
    { $count ->
        [one] { $count } unread notification
       *[other] { $count } unread notifications
    }
notification-mark-all-read = Mark all read
notification-clear-all = Clear all
notification-dismiss = Dismiss
notification-unread = Unread
notification-loading = Loading notifications…
notification-empty-title = You're all caught up
notification-empty-hint = Activity from your groups will show up here.
notification-error = Couldn't load notifications.
notification-retry = Retry
notification-settings = Notification settings
notification-more = More options

## Requests
notification-requests-title = Requests
notification-requests-badge =
    { $count ->
        [one] { $count } pending request
       *[other] { $count } pending requests
    }
notification-accept = Accept
notification-ignore = Ignore
notification-friend-request-title = Friend request
notification-friend-request-body = { $name } wants to be your friend.
notification-request-remark = “{ $remark }”
notification-group-invite-title = Group invite
notification-group-invite-body = { $inviter } invited you to join { $group }.
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
notification-settle-up-created-title = New settle-up in { $group }
notification-settle-up-created-body = { $creator } started a settle-up.
notification-related-settle-up-created-title = You're in a new settle-up
notification-related-settle-up-created-body = { $creator } started a settle-up in { $group }.
notification-settlement-recorded-title = New payment in { $group }
notification-settlement-recorded-body = { $from } says they paid { $to } { $amount }.
notification-settlement-confirmed-title = Payment confirmed in { $group }
notification-settlement-confirmed-body = { $to } confirmed a payment of { $amount } from { $from }.
notification-related-settlement-recorded-title = Confirm a payment
notification-related-settlement-recorded-body = { $from } says they paid you { $amount } in { $group }.
notification-related-settlement-confirmed-title = Payment confirmed
notification-related-settlement-confirmed-body = { $to } confirmed your payment of { $amount }.
notification-settle-up-done-title = Settle-up done in { $group }
notification-settle-up-done-body = Every payment in this settle-up is confirmed.
notification-related-settle-up-done-title = Your settle-up is done
notification-related-settle-up-done-body = Every payment in your { $group } settle-up is confirmed.
notification-someone = Someone

## Settings page
notification-settings-title = Notifications
notification-settings-group-title = Group notifications
notification-settings-intro = Choose which activity you want to hear about. Friend requests and group invites are always sent.
notification-settings-group-intro = These settings apply only to { $group } and override your global preferences.
notification-settings-follow-global = Uses global setting
notification-settings-reset-group = Use global settings
notification-settings-reset-group-success = Group notifications now use your global settings
notification-settings-saved = Saved
notification-settings-error = Couldn't save changes. Try again.
notification-settings-loading = Loading…

notification-settings-section-friends = Friends
notification-settings-section-transactions = Expenses
notification-settings-section-invoices = Settle-ups
notification-settings-section-settlements = Payments
notification-settings-section-invoice-settled = Finished settle-ups

notification-type-FriendRequestAccepted = Friend request accepted
notification-type-FriendRequestAccepted-hint = When someone accepts your friend request
notification-type-TransactionCreated = Other expenses in my groups
notification-type-TransactionCreated-hint = Expenses you aren't part of
notification-type-RelatedTransactionCreated = Expenses I'm part of
notification-type-RelatedTransactionCreated-hint = Expenses where you paid or owe a share
notification-type-InvoiceCreated = Other settle-ups in my groups
notification-type-InvoiceCreated-hint = Settle-ups that don't include you
notification-type-RelatedInvoiceCreated = Settle-ups that include me
notification-type-RelatedInvoiceCreated-hint = Settle-ups where you owe or are owed
notification-type-SettlementRecorded = Other payments in my groups
notification-type-SettlementRecorded-hint = Payments between other members
notification-type-RelatedSettlementRecorded = Payments involving me
notification-type-RelatedSettlementRecorded-hint = Payments you made or received
notification-type-InvoiceSettled = Other settle-ups finished
notification-type-InvoiceSettled-hint = Settle-ups that don't include you
notification-type-RelatedInvoiceSettled = My settle-ups finished
notification-type-RelatedInvoiceSettled-hint = Settle-ups where you owed or were owed

## Group settings / invites
group-settings-title = Group settings
group-settings-invite = Invite friends
group-settings-invite-hint = Friends join once they accept
group-settings-notifications = Notifications
group-settings-notifications-hint = Choose which updates you get from this group
group-invite-title = Invite friends
group-invite-empty-title = All your friends are here
group-invite-empty = Share the group link to invite someone new.
group-invite-no-friends-title = No friends to invite
group-invite-no-friends = Share the group link, or add friends from your profile.
group-invite-copy-link = Copy invite link
group-invite-pending = Invited
group-invite-submit =
    { $count ->
        [0] Send invites
        [one] Send { $count } invite
       *[other] Send { $count } invites
    }
group-invite-success =
    { $count ->
        [one] Invite sent
       *[other] { $count } invites sent
    }
group-invite-error = Couldn't send invites. Try again.
group-invite-pending-title = Pending invites
