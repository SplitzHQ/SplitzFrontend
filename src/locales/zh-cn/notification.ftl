## Bell / panel
notification-title = 通知
notification-open = 打开通知
notification-unread-count = { $count } 条未读通知
notification-mark-all-read = 全部标为已读
notification-clear-all = 清空
notification-dismiss = 忽略
notification-empty-title = 没有新通知
notification-empty-hint = 群组里的动态会显示在这里。
notification-error = 无法加载通知。
notification-retry = 重试
notification-settings = 通知设置
notification-close = 关闭

## Requests
notification-requests-title = 请求
notification-requests-badge = { $count } 个待处理请求
notification-accept = 接受
notification-ignore = 忽略
notification-friend-request-title = 好友请求
notification-friend-request-body = { $name } 想加你为好友。
notification-group-invite-title = 群组邀请
notification-group-invite-body = { $inviter } 邀请你加入 { $group }。
notification-request-accepted = 已接受
notification-request-ignored = 已忽略
notification-request-error = 出了点问题，请重试。
notification-friend-request-accepted-toast = 你和 { $name } 已成为好友
notification-group-invite-accepted-toast = 你已加入 { $group }

## Activity messages
notification-friend-accepted-title = 好友请求已接受
notification-friend-accepted-body = { $name } 接受了你的好友请求。
notification-transaction-created-title = { $group } 有新支出
notification-transaction-created-body = { $creator } 添加了 { $name }，金额 { $amount }。
notification-related-transaction-created-title = 你参与了一笔新支出
notification-related-transaction-owe-body = { $creator } 添加了 { $name }。你需支付 { $amount }。
notification-related-transaction-lent-body = { $creator } 添加了 { $name }。你应收 { $amount }。
notification-invoice-created-title = { $group } 有新账单
notification-invoice-created-body = { $creator } 创建了 { $invoice }。
notification-related-invoice-created-title = 你被加入了一张新账单
notification-related-invoice-created-body = { $creator } 在 { $group } 创建了 { $invoice }。
notification-settlement-recorded-title = { $group } 记录了一笔结算
notification-settlement-recorded-body = { $recorder } 记录了 { $from } 向 { $to } 支付 { $amount }。
notification-related-settlement-recorded-title = 与你相关的结算已记录
notification-related-settlement-recorded-body = { $recorder } 在 { $invoice } 上记录了 { $from } 向 { $to } 支付 { $amount }。
notification-invoice-settled-title = { $group } 的账单已结清
notification-invoice-settled-body = { $invoice } 已全部结清。
notification-related-invoice-settled-title = 你的账单已结清
notification-related-invoice-settled-body = { $group } 中的 { $invoice } 已全部结清。
notification-invoice-unnamed = 未命名账单
notification-someone = 某人

## Settings page
notification-settings-title = 通知
notification-settings-group-title = 群组通知
notification-settings-intro = 选择你想收到哪些动态。好友请求和群组邀请始终会送达。
notification-settings-group-intro = 这里的设置只对 { $group } 生效，会覆盖全局设置。
notification-settings-follow-global = 跟随全局设置
notification-settings-reset-group = 使用全局设置
notification-settings-reset-group-success = 该群组的通知已恢复为全局设置
notification-settings-saved = 已保存
notification-settings-error = 保存失败，请重试。
notification-settings-loading = 加载中…

notification-settings-section-friends = 好友
notification-settings-section-transactions = 支出
notification-settings-section-invoices = 账单
notification-settings-section-settlements = 结算
notification-settings-section-invoice-settled = 已结清账单

notification-type-FriendRequestAccepted = 好友请求被接受
notification-type-FriendRequestAccepted-hint = 有人接受你的好友请求时
notification-type-TransactionCreated = 群组里的其他支出
notification-type-TransactionCreated-hint = 与你无关的支出
notification-type-RelatedTransactionCreated = 我参与的支出
notification-type-RelatedTransactionCreated-hint = 你付款或需付款的支出
notification-type-InvoiceCreated = 群组里的其他账单
notification-type-InvoiceCreated-hint = 不包含你的账单
notification-type-RelatedInvoiceCreated = 包含我的账单
notification-type-RelatedInvoiceCreated-hint = 你需付款或应收款的账单
notification-type-SettlementRecorded = 群组里的其他结算
notification-type-SettlementRecorded-hint = 其他成员之间的付款
notification-type-RelatedSettlementRecorded = 与我相关的结算
notification-type-RelatedSettlementRecorded-hint = 你支付或收到的款项
notification-type-InvoiceSettled = 其他账单结清
notification-type-InvoiceSettled-hint = 不包含你的账单
notification-type-RelatedInvoiceSettled = 我的账单结清
notification-type-RelatedInvoiceSettled-hint = 你需付款或应收款的账单

## Group settings / invites
group-settings-title = 群组设置
group-settings-invite = 邀请好友
group-settings-invite-hint = 好友接受后即可加入
group-settings-notifications = 通知
group-settings-notifications-hint = 选择这个群组向你推送哪些内容
group-invite-title = 邀请好友
group-invite-empty = 你的好友都已在这个群组里了。
group-invite-no-friends = 请先在个人资料中添加好友。
group-invite-pending = 已邀请
group-invite-submit = { $count ->
    [0] 发送邀请
   *[other] 发送 { $count } 个邀请
}
group-invite-success = 已发送 { $count } 个邀请
group-invite-error = 发送邀请失败，请重试。
group-invite-pending-title = 等待回复
