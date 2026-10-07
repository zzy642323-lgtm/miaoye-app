# 喵页 · Meow Journal

猫咪陪伴的照片手账 APP，包含手账编辑、日历回顾、猫咪小屋、收藏插画和安卓离线版本。

- 正式网页：https://s7ianzbg94fw.meoo.run
- 安卓下载：https://s7ianzbg94fw.meoo.run/android.html
- 秒悟项目：https://meoo.com/chat/s7ianzbg94fw

## 项目结构

- `meoo/`：当前正式部署版本，独立 Node HTTP 服务和网页素材，以及 0.20.0 测试 APK。
- `original/`：原 Sites 版本源码、安卓原生壳、构建脚本、素材提示词、数据库定义与测试。

## 本地运行

需要 Node.js 24。在 `meoo` 目录运行：

```sh
node server.mjs
```

打开 http://127.0.0.1:9000 。验证：`node tests/server.test.mjs`。

## 秒悟部署

安装官方 `@aliyun-meoo/cli`，执行 `meoo login`；在 `meoo` 目录绑定项目 `meoo projects use s7ianzbg94fw`，再运行 `meoo deploy --runtime image --force`。脚本使用 LF 换行。当前版本需要开通秒悟云服务，并执行 meoo/migrations/cloud-backups.sql 和 meoo/migrations/friends.sql；环境变量由秒悟注入。

## 数据与安卓

手账默认保存在本机；联网云账号支持主动开启私密备份、自动备份及换手机恢复。0.20 增加双方同意的好友关系、单页预览确认分享、点赞和撤回。原始照片库及未分享手账不会出现在好友区。安卓包包含全部离线资源，覆盖安装保留手账。已通过编译、签名、103 个本地资源和请求路由检查，两台手机的真实分享流程仍需实机验收。

## 0.17 更新

系统相机拍照；一次最多选择 20 张照片；随包提供 U²-Net small 和 ONNX Runtime Web WASM，本机抠图无需把照片传给外部服务。五只猫按各自性格分别拥有十个独立故事，五张原画完整保留，新增 45 张独立插画；旧收藏继续读取原画，新故事不重复。

- 云端管理与免费平台方案：[说明](original/docs/云端管理与联网服务说明.md)。当前尚未开通用户云同步。
- 猫咪性格、50 个故事与画风：[创作规范](original/docs/猫咪故事与插画规范.md)。
- PNG 原稿、生成提示词与验收缩略图：[插画目录](original/artwork/)。使用内置 ImageGen 生成。

安卓构建见 `original/android/README.md`。官方 Android 工具、JDK 和本机签名密钥需单独准备；签名密钥不在仓库内。重新生成密钥会导致无法覆盖升级原测试包。

仓库不包含部署凭据、签名私钥、用户照片或用户手账。素材授权说明保留于各素材目录；未授予整个项目额外开源许可。

## 0.18 安卓联网与云备份

已使用原秒悟项目的免费云服务接入用户名密码登录、私密快照备份、联网重试与换手机恢复。每台设备保留最近 3 份；单份最多 50 MB，项目合计免费空间 1 GB。首次上传由用户主动开启。原插画和离线本机抠图保留，APK 用原签名覆盖升级。

下载：https://s7ianzbg94fw.meoo.run/android.html
使用说明：original/docs/安卓版联网与云备份使用说明.md

后台设置：meoo/migrations/cloud-backups.sql 在原秒悟项目已执行，RLS 与私密存储策略已启用。服务端需要平台注入 SUPABASE_URL 与 SUPABASE_ANON_KEY，不能把管理密钥写进网页或 APK。


0.19 修正版：兼容没有 AbortSignal.timeout 的旧 Android WebView，注册登录表单显示输入错误、连接进度和失败原因。请从线上 android.html 下载 0.19 覆盖安装，保留原有手账。38 项原应用测试和 2 项部署测试通过。


## 0.20 好友分享

右上角好友手账 → 管理好友 → 输入用户名申请 → 对方同意。打开已保存手账分享当前页，预览确认后仅好友可见；支持点赞、取消点赞、撤回和移除好友。使用说明：original/docs/好友手账分享使用说明.md。39 项原应用测试、2 项部署测试及三个真实临时云账号的好友权限验证通过。
