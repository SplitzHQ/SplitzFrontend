invoice-detail-loading = Loading…
invoice-detail-error = Couldn't load invoice details.
invoice-detail-created-by =
    { $who ->
        [you] Created by you · { $date }
       *[other] Created by { $name } · { $date }
    }
invoice-detail-debts-title = Balances to settle
invoice-detail-debts-empty = Everyone's even. Nothing to settle.
invoice-detail-debt-you-to = You owe { $name }
invoice-detail-debt-to-you = { $name } owes you
invoice-detail-debt-between = { $from } owes { $to }
invoice-detail-debt-remaining = { $amount } left
invoice-detail-debt-paid = Paid
invoice-detail-mark-paid = Mark as paid
invoice-detail-mark-paid-confirm-title = Mark as paid?
invoice-detail-mark-paid-confirm-message = Only do this after the money has changed hands. Everyone in the group will see this payment.
invoice-detail-mark-paid-error = Couldn't mark as paid. Please try again.
invoice-detail-cancel = Cancel
invoice-detail-payments-title = Payments
invoice-detail-payment-you-to = You paid { $name }
invoice-detail-payment-to-you = { $name } paid you
invoice-detail-payment-between = { $from } paid { $to }
invoice-detail-payment-recorded-by =
    { $who ->
        [you] Recorded by you · { $date }
       *[other] Recorded by { $name } · { $date }
    }
invoice-detail-undo = Undo payment
invoice-detail-undo-error = Couldn't undo payment. Please try again.
invoice-detail-expenses-title = Included expenses
