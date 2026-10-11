# 喵页 1.0.5

新版覆盖 0.22，无旧版入口。安卓本地提供页面、小猫和贴纸；大型旅行插画与抠图引擎从固定 HTTPS 地址获取并校验 SHA-256 后缓存。首次联网下载后可再次使用。

手机号作为唯一账号名，密码登录，不进行短信归属验证。复用云端唯一邮箱身份（手机号@meoo.local）防止重复注册；旧用户名账号仍可登录。

「我的」底部提供版本更新和教程入口。更新检查 version.json，安装前校验包名、版本、SHA-256 和原签名，由 Android 系统确认安装。

按用户要求首次升级清除旧版 IndexedDB miaoye-journal 及非 preview 格式键，保留 1.0 数据。

本地：node server.mjs。验证：node --test --test-isolation=none tests/*.test.mjs。安卓：android/build.ps1，使用已有签名。

部署：meoo deploy --runtime image；setup 只还原已校验的轻量 APK，不覆盖网页源码。
