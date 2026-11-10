settle-up-start-title = Settle up everything
settle-up-start-description = Everyone pays these amounts. Expenses added after now go to the next settle-up.
settle-up-start-covers =
    { $count ->
        [one] Covers { $count } expense · { $range }
       *[other] Covers { $count } expenses · { $range }
    }
settle-up-start-even = Everyone is even, so there's nothing to pay.
settle-up-start-submit = Start settle-up
settle-up-start-cancel = Cancel
settle-up-start-error = Couldn't start the settle-up. Try again.
settle-up-expenses-title =
    { $count ->
        [one] { $count } expense
       *[other] { $count } expenses
    }
settle-up-expense-paid-by = { $date } · paid by { $name }
settle-up-expense-split = Split
settle-up-expense-will-lock = Starting the settle-up locks this expense. Nobody can change it after that.
settle-up-back = Back
settle-up-transfer-you-pay = You pay { $name }
settle-up-transfer-pays-you = { $name } pays you
settle-up-transfer-between = { $from } pays { $to }
settle-up-state-open = Not paid yet
settle-up-state-sent-to-you = { $name } marked it paid
settle-up-state-sent = Waiting for { $name } to confirm
settle-up-state-done = Paid and confirmed
settle-up-mark-paid = Mark paid
settle-up-confirm = Confirm
settle-up-mark-paid-title = Mark { $amount } as paid?
settle-up-mark-paid-description = Do this after you send the money. { $name } then confirms that it arrived.
settle-up-mark-paid-cancel = Cancel
settle-up-mark-paid-error = Couldn't mark it as paid. Try again.
settle-up-confirm-title = Did { $name } pay you?
settle-up-confirm-description = { $name } marked { $amount } as paid. Confirm when the money is in your account.
settle-up-confirm-submit = Confirm { $amount }
settle-up-confirm-reject = Not received
settle-up-confirm-error = Couldn't save your answer. Try again.
settle-up-round-title = Settle-up · { $date }
settle-up-round-in-progress = Settle-up in progress
settle-up-round-progress = { $done } of { $total } paid
settle-up-round-started =
    { $count ->
        [one] Started { $date } · covers { $count } expense up to then
       *[other] Started { $date } · covers { $count } expenses up to then
    }
settle-up-round-settled = Settled up
settle-up-round-summary =
    { $count ->
        [one] { $date } · { $count } expense
       *[other] { $date } · { $count } expenses
    }
settle-up-next-confirm = Confirm { $name }'s payment
settle-up-next-pay = Pay { $name }
settle-up-next-none = Nothing to do for you
settle-up-locked = This expense is in a settle-up, so nobody can change it.
settle-up-cancel = Cancel settle-up
settle-up-cancel-title = Cancel this settle-up?
settle-up-cancel-description = Its expenses go back to the list, and nobody has to pay for them yet.
settle-up-cancel-keep = Keep it
settle-up-cancel-error = Couldn't cancel the settle-up. Try again.
settle-up-status-loading = Loading settle-up…
settle-up-status-loaded = Settle-up loaded
settle-up-error = Couldn't load this settle-up.
settle-up-retry = Try again
