# 喵页 · Meow Journal

猫咪陪伴的照片手账 APP，包含手账编辑、日历回顾、猫咪小屋、收藏插画和安卓离线版本。

- 正式网页：https://s7ianzbg94fw.meoo.run
- 安卓下载：https://s7ianzbg94fw.meoo.run/android.html
- 秒悟项目：https://meoo.com/chat/s7ianzbg94fw

## 项目结构

- `meoo/`：当前正式部署版本，独立 Node HTTP 服务和网页素材，以及 0.16.0 测试 APK。
- `original/`：原 Sites 版本源码、安卓原生壳、构建脚本、素材提示词、数据库定义与测试。

## 本地运行

需要 Node.js 24。在 `meoo` 目录运行：

```sh
node server.mjs
```

打开 http://127.0.0.1:9000 。验证：`node tests/server.test.mjs`。

## 秒悟部署

安装官方 `@aliyun-meoo/cli`，执行 `meoo login`；在 `meoo` 目录绑定项目 `meoo projects use s7ianzbg94fw`，再运行 `meoo deploy --runtime image --force`。脚本使用 LF 换行。无需开通数据库或云服务。

## 数据与安卓

当前网页无需账号，手账保存于当前浏览器。域名之间的数据不自动迁移。安卓 0.16.0 把资源打包进 APK，不申请联网权限；安装包 SHA256 为 `76F24B847A7A40AD54711B9E5B2F28D0B541763F89A13FE911AE21C45EB76905`。启动和资源路由已完成代码测试，尚未完成安卓实机验证。

安卓构建见 `original/android/README.md`。官方 Android 工具、JDK 和本机签名密钥需单独准备；签名密钥不在仓库内。重新生成密钥会导致无法覆盖升级原测试包。

仓库不包含部署凭据、签名私钥、用户照片或用户手账。素材授权说明保留于各素材目录；未授予整个项目额外开源许可。
