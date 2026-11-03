# 调试面板（src/debug）。只有开发环境和带 VITE_SPLITZ_DEBUG_TOOLS=true 的构建会加载这个文件。

## Panel

debug-panel-title = 调试工具
debug-panel-toggle-tip = 调试工具（Ctrl+Shift+D）
debug-panel-hide = 隐藏
debug-panel-hide-tip = 隐藏按钮和顶部提示条，刷新后恢复。按 Ctrl+Shift+D 可以马上找回来。
debug-panel-close = 关闭
debug-panel-search = 搜索工具…
debug-panel-search-label = 搜索调试工具
debug-panel-no-match = 没有找到「{ $query }」
debug-panel-real = 真实
debug-panel-real-tip = 不做模拟，应用照常运行。
debug-panel-changes = 会改动这个浏览器里的数据
debug-panel-copied = 已复制
debug-panel-copy-failed = 复制失败，浏览器拒绝了剪贴板权限。

## Strip of active simulations

debug-panel-simulating = 正在模拟 { $count } 项
debug-panel-sim-choice = { $sim }：{ $choice }
debug-panel-undo = 撤销
debug-panel-undo-sim = 撤销「{ $sim }」
debug-panel-undo-all = 全部撤销

## Pages

debug-panel-pages = 页面
debug-panel-pages-go = 前往
debug-panel-pages-go-tip = 在当前标签页打开页面。右边显示的是当前路由。
debug-panel-page-home = 首页
debug-panel-page-home-tip = 你的群组和余额。
debug-panel-page-profile = 个人资料
debug-panel-page-profile-tip = 你的账号、好友和设置。
debug-panel-page-notifications = 通知
debug-panel-page-notifications-tip = 账号的通知设置。
debug-panel-page-receipt = 小票识别
debug-panel-page-receipt-tip = 从照片识别小票的设置。
debug-panel-page-2fa = 两步验证设置
debug-panel-page-2fa-tip = 开启两步验证的页面。
debug-panel-page-login = 登录
debug-panel-page-login-tip = 登录页。不会退出当前账号。

## Session

debug-panel-session = 会话
debug-panel-user = 当前用户
debug-panel-user-tip = 应用从服务器拿到的用户。
debug-panel-user-none = 未登录
debug-panel-user-copy-id = 复制用户 ID
debug-panel-user-copy-id-tip = 复制你的用户 ID，方便调接口或查数据库。
debug-panel-user-reload = 重新加载用户
debug-panel-user-reload-tip = 重新获取你的用户信息、好友和余额。
debug-panel-token = 访问令牌
debug-panel-token-tip = 每次调接口用的令牌，过期后会自动刷新。
debug-panel-token-none = 无
debug-panel-token-expired = 已过期
debug-panel-token-no-expiry = 没有过期时间
debug-panel-token-minutes-left = 还剩 { $count } 分钟
debug-panel-token-expire = 立即过期
debug-panel-token-expire-tip = 把令牌标成已过期。下一次调接口时会刷新它，方便测试刷新流程。
debug-panel-token-sign-out = 退出登录
debug-panel-token-sign-out-tip = 删除你的令牌并打开登录页。

## Network

debug-panel-network = 网络
debug-panel-api = 接口响应
debug-panel-api-tip = 模拟 Splitz 接口的返回，其他请求不受影响。
debug-panel-api-slow = 慢速
debug-panel-api-slow-tip = 每个接口请求先等 2 秒，用来看加载状态。
debug-panel-api-offline = 离线
debug-panel-api-offline-tip = 每个接口请求都像断网一样失败。
debug-panel-api-server-error = 服务器出错
debug-panel-api-server-error-tip = 每个接口请求都返回 500 错误。
debug-panel-api-rate-limit = 请求太频繁
debug-panel-api-rate-limit-tip = 每个接口请求都返回 429 错误，要等 30 秒。用来看倒计时。
debug-panel-cache = 缓存数据
debug-panel-cache-tip = 应用缓存的数据，让页面打开更快。
debug-panel-cache-count = { $count } 条查询
debug-panel-cache-refetch = 全部重新获取
debug-panel-cache-refetch-tip = 把所有缓存标成过期，并重新加载当前页面上的数据。

## Language

debug-panel-language = 语言
debug-panel-locale = 应用语言
debug-panel-locale-tip = 换一种语言显示应用，刷新后恢复。用来找漏翻或太长的文案。
debug-panel-locale-en = English
debug-panel-locale-zh-cn = 简体中文
debug-panel-locale-choice-tip = 用这种语言显示应用，刷新后恢复。

## Browser failures

debug-panel-failures = 浏览器故障
debug-panel-storage-full = 存储已满
debug-panel-storage-full-tip = 每次写入本地存储都会失败，就像浏览器禁止了网站数据。登录后也存不下令牌。
debug-panel-clipboard-denied = 剪贴板被拒
debug-panel-clipboard-denied-tip = 浏览器拒绝复制和粘贴，比如复制邀请链接时。

## Local data

debug-panel-data = 本地数据
debug-panel-data-local = 这个浏览器
debug-panel-data-local-tip = Splitz 存在这个浏览器里的东西：令牌和设置。
debug-panel-data-clear = 清空并刷新
debug-panel-data-clear-tip = 删除 Splitz 在这个浏览器里存的所有数据，退出登录并刷新页面。面板布局会保留。
