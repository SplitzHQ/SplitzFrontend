## Bell / panel
notification-title = 通知
notification-open = 打开通知
notification-unread-count = { $count } 条未读通知
notification-mark-all-read = 全部标为已读
notification-clear-all = 清空
notification-dismiss = 忽略
notification-empty-title = 暂无新通知
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
notification-request-error = 操作失败，请重试。
notification-friend-request-accepted-toast = 你和 { $name } 已成为好友
notification-group-invite-accepted-toast = 已加入 { $group }

## Activity messages
notification-friend-accepted-title = 好友请求已通过
notification-friend-accepted-body = { $name } 接受了你的好友请求。
notification-transaction-created-title = { $group } 有新支出
notification-transaction-created-body = { $creator } 添加了「{ $name }」，共 { $amount }。
notification-related-transaction-created-title = 你有一笔新分摊
notification-related-transaction-owe-body = { $creator } 添加了「{ $name }」，你应还 { $amount }。
notification-related-transaction-lent-body = { $creator } 添加了「{ $name }」，你应收 { $amount }。
notification-invoice-created-title = { $group } 有新结算单
notification-invoice-created-body = { $creator } 创建了 { $invoice }。
notification-related-invoice-created-title = 你有一张新结算单
notification-related-invoice-created-body = { $creator } 在 { $group } 创建了 { $invoice }。
notification-settlement-recorded-title = { $group } 记录了一笔还款
notification-settlement-recorded-body = { $recorder } 记录了 { $from } 向 { $to } 支付 { $amount }。
notification-related-settlement-recorded-title = 收到一笔与你相关的还款记录
notification-related-settlement-recorded-body = { $recorder } 在 { $invoice } 中记录了 { $from } 向 { $to } 支付 { $amount }。
notification-invoice-settled-title = { $group } 的结算单已结清
notification-invoice-settled-body = { $invoice } 已全部结清。
notification-related-invoice-settled-title = 你的结算单已结清
notification-related-invoice-settled-body = { $group } 中的 { $invoice } 已全部结清。
notification-invoice-unnamed = 未命名结算单
notification-someone = 群成员

## Settings page
notification-settings-title = 通知
notification-settings-group-title = 群组通知
notification-settings-intro = 选择你想接收的动态提醒。好友请求和群组邀请始终会发送。
notification-settings-group-intro = 以下设置仅对 { $group } 生效，并优先于全局设置。
notification-settings-follow-global = 跟随全局设置
notification-settings-reset-group = 恢复默认设置
notification-settings-reset-group-success = 该群组的通知已恢复为跟随全局设置
notification-settings-saved = 已保存
notification-settings-error = 保存失败，请重试。
notification-settings-loading = 加载中…

notification-settings-section-friends = 好友
notification-settings-section-transactions = 支出
notification-settings-section-invoices = 结算单
notification-settings-section-settlements = 还款记录
notification-settings-section-invoice-settled = 结清提醒

notification-type-FriendRequestAccepted = 好友请求已通过
notification-type-FriendRequestAccepted-hint = 对方接受你的好友请求时
notification-type-TransactionCreated = 群内其他支出
notification-type-TransactionCreated-hint = 你未参与分摊的支出
notification-type-RelatedTransactionCreated = 与我相关的支出
notification-type-RelatedTransactionCreated-hint = 你垫付或参与分摊的支出
notification-type-InvoiceCreated = 群内其他结算单
notification-type-InvoiceCreated-hint = 不包含你的结算单
notification-type-RelatedInvoiceCreated = 包含我的结算单
notification-type-RelatedInvoiceCreated-hint = 涉及你应收或应还的结算单
notification-type-SettlementRecorded = 群内其他还款
notification-type-SettlementRecorded-hint = 其他成员之间的还款记录
notification-type-RelatedSettlementRecorded = 与我相关的还款
notification-type-RelatedSettlementRecorded-hint = 你支付或收到的款项
notification-type-InvoiceSettled = 其他结算单已结清
notification-type-InvoiceSettled-hint = 不包含你的结算单
notification-type-RelatedInvoiceSettled = 我的结算单已结清
notification-type-RelatedInvoiceSettled-hint = 涉及你应收或应还的结算单

## Group settings / invites
group-settings-title = 群组设置
group-settings-invite = 邀请好友
group-settings-invite-hint = 好友接受邀请后即可入群
group-settings-notifications = 通知设置
group-settings-notifications-hint = 设置该群组向你发送哪些提醒
group-invite-title = 邀请好友
group-invite-empty = 你的好友都在这个群组里了。
group-invite-no-friends = 请先在个人资料中添加好友。
group-invite-pending = 已邀请
group-invite-submit =
    { $count ->
        [0] 发送邀请
       *[other] 发送 { $count } 份邀请
    }
group-invite-success = 已发送 { $count } 份邀请
group-invite-error = 发送邀请失败，请重试。
group-invite-pending-title = 等待对方回应
