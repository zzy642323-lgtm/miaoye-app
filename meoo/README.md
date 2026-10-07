# 喵页 · 秒悟部署版

喵页 0.20 包含本机手账、猫咪小屋、日历回顾和安卓安装包，并接入秒悟托管的 Supabase 账号、数据库和私有文件存储。本机数据仍保存到 IndexedDB；用户主动开启备份后，照片和手账快照才上传。新域名不能读取旧域名的浏览器记录。

本地启动：`node server.mjs`，需要 Node.js 22 及以上。秒悟部署：`meoo deploy --runtime image --force`。服务监听 `0.0.0.0:${PORT:-9000}`。云端需要注入 `SUPABASE_URL` 和 `SUPABASE_ANON_KEY`，运行 `migrations/cloud-backups.sql`，并启用密码注册登录。服务仅使用匿名项目密钥和用户 JWT，不使用服务角色密钥。

保留系统拍照、多图选择、本机智能抠图、五只猫各十张不同故事海报和原有五张插画。云备份使用说明见原项目 `docs/安卓版联网与云备份使用说明.md`。这是整份快照备份与手动恢复，不合并多个设备的并行编辑。

为避开本机大文件上传超时，镜像构建通过 `scripts/setup.sh` 执行 `scripts/restore-release.mjs`：下载此前发布的 0.17 APK，应用 `scripts/apk-update.json.gz` 差异包，还原已签名的最新 APK，再从 APK 提取插画、字体和抠图模型。脚本校验基础包及最终包 SHA-256，校验不符就停止构建。`.dockerignore` 排除的资源由该步骤还原；本地调试先运行还原脚本。发布镜像同时保留 0.17 基础包，供后续构建复用。

验证：`node --test tests/*.test.mjs`。`scripts/cloud-smoke.mjs` 使用临时虚拟账号验证真实登录、私有备份和账号隔离；可通过 `MIAOYE_CLOUD_TEST_BASE` 指定线上 `/cloud/` 地址。执行后须运行生成的 `.cloud-qa/cleanup.sql` 清理临时账号。`.env`、`.meoo`、测试账号凭据和安卓签名私钥禁止提交。

0.19 修复注册登录在旧 WebView 的兼容问题，并增加持续可见的表单错误及连接状态提示。发布差异包可通过 `python scripts/make-apk-update.py BASE_APK NEW_APK` 重新生成。


0.20 新增双向同意的好友申请、当前页预览确认分享、好友点赞与取消、撤回分享和移除好友。还需执行 migrations/friends.sql。好友数据采用独立表和授权 RPC，不读取私密云备份。scripts/friends-smoke.mjs 使用三个临时账号验证权限，运行后通过 .cloud-qa/friends-cleanup.sql 清理。使用说明见原项目 docs/好友手账分享使用说明.md。
