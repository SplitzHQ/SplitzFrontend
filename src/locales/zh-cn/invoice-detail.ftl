invoice-detail-loading = 加载中…
invoice-detail-error = 无法加载结算单详情。
invoice-detail-created-by =
    { $who ->
        [you] 你创建于 { $date }
       *[other] { $name } 创建于 { $date }
    }
invoice-detail-debts-title = 还款明细
invoice-detail-debts-empty = 大家已经两清，没有需要还的钱。
invoice-detail-debt-you-to = 你应还 { $name }
invoice-detail-debt-to-you = { $name } 应还你
invoice-detail-debt-between = { $from } 应还 { $to }
invoice-detail-debt-remaining = 还差 { $amount }
invoice-detail-debt-paid = 已还
invoice-detail-mark-paid = 标记为已还
invoice-detail-mark-paid-confirm-title = 标记为已还？
invoice-detail-mark-paid-confirm-message = 请在钱已经转过去之后再标记。群组里的所有人都能看到这笔还款。
invoice-detail-mark-paid-error = 标记失败，请重试。
invoice-detail-cancel = 取消
invoice-detail-payments-title = 还款记录
invoice-detail-payment-you-to = 你还给了 { $name }
invoice-detail-payment-to-you = { $name } 还给了你
invoice-detail-payment-between = { $from } 还给了 { $to }
invoice-detail-payment-recorded-by =
    { $who ->
        [you] 你记录于 { $date }
       *[other] { $name } 记录于 { $date }
    }
invoice-detail-undo = 撤销还款
invoice-detail-undo-error = 撤销还款失败，请重试。
invoice-detail-expenses-title = 包含的支出
