new-expense-title = 新费用
new-expense-frequency-one-time = 单次

new-expense-actions-skip = 跳过
new-expense-actions-next = 下一步
new-expense-actions-done = 完成

new-expense-pronoun-you = 我

new-expense-sections-recent = 最近
new-expense-sections-groups = 群组
new-expense-sections-friends = 朋友

new-expense-select-people-title = 选择人 / 群组
new-expense-select-people-with = 参与：
new-expense-select-people-search-placeholder = 按名称，@用户名，Email 或手机号搜索

new-expense-split-title = 选择拆分方法
new-expense-split-paid-by = 付款人: { $username }
new-expense-split-types-equally = 平均分摊
new-expense-split-types-percentage = 百分比
new-expense-split-types-shares = 份数
new-expense-split-types-adjustment = 调整
new-expense-split-types-custom = 自定义
new-expense-split-summary-total-amount = 总金额
new-expense-split-summary-included = 已包含（{ $count } 人）
new-expense-split-summary-not-included = 未包含（{ $count } 人）
new-expense-split-shares-count =
    { $count ->
        [one] { $count } 份
       *[other] { $count } 份
    }
new-expense-split-validation-invalid-input = 输入无效
new-expense-split-actions-complete = 完成

new-expense-review-title = 查看并完成
new-expense-review-expense-added-to = 已添加到
new-expense-review-you-owe = 你需要支付
new-expense-review-you-are-owed = 你将收到
new-expense-review-actions-add-details = 添加详情
new-expense-review-button-name = 取个名字
new-expense-review-button-category = 添加类别
new-expense-review-button-location = 添加地点
new-expense-review-button-receipt = 上传收据
new-expense-review-fields-name-label = 类别和名称
new-expense-review-fields-name-placeholder = 这是用来做什么的？
new-expense-review-fields-location = 地点
new-expense-review-fields-location-placeholder = 搜索地点
new-expense-review-fields-location-disclaimer = 如果您点击了左边的按钮，您的位置坐标将被发送到 OpenStreetMap Nominatim API 以获取坐标对应的实际地址
new-expense-review-fields-receipt = 图片
new-expense-review-fields-notes-label = 备注
new-expense-review-fields-notes-placeholder = 还有什么需要补充的吗？
new-expense-review-actions-done = 保存
new-expense-review-actions-retry-receipt = 重试上传收据
new-expense-review-error-saving-transaction = 保存失败，请重试
new-expense-review-receipt-rate-limit = 上传过于频繁。请在 { $seconds } 秒后重试。
new-expense-review-error-receipt-not-image = 请选择图片文件
new-expense-review-error-receipt-too-large = 图片大小需小于 { $maxMb }MB

new-expense-review-actions-select-category = 选择类别
new-expense-review-category-search-placeholder = 搜索

new-expense-scan-button = 扫描收据
new-expense-scan-title = 扫描收据
new-expense-scan-intro = 添加同一张收据的一张或多张照片。金额、币种、名称、类别和日期会自动填好，请在继续前核对。
new-expense-scan-loading = 正在检查是否可用…
new-expense-scan-add-gallery = 相册
new-expense-scan-add-camera = 相机
new-expense-scan-remove-image = 移除图片
new-expense-scan-count = { $count } / { $max } 张图片
new-expense-scan-too-many = 最多可添加 { $max } 张图片
new-expense-scan-recognize = 识别收据
new-expense-scan-recognizing = 正在识别…
new-expense-scan-applied = 已根据收据填写。继续前请核对信息。
new-expense-scan-from-receipt = 来自收据：{ $name }
new-expense-scan-failed = 无法识别这张收据，请换一张更清晰的照片。
new-expense-scan-error = 识别收据时出错，请重试。
new-expense-scan-rate-limit = 扫描过于频繁。请在 { $seconds } 秒后重试。
new-expense-scan-unavailable = 尚未设置收据扫描。请在个人资料中添加你自己的模型服务后使用。
new-expense-scan-unavailable-fixed = 此服务器不提供收据扫描。
new-expense-scan-open-settings = 设置模型服务
new-expense-scan-privacy = 照片会发送给所配置的模型服务，并随此笔费用一起保存。
