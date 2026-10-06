# 本机抠图模型

U²-Net small (`u2netp.onnx`), source: https://github.com/danielgatis/rembg/releases/download/v0.0.0/u2netp.onnx

Model project: https://github.com/xuebinqin/U-2-Net

MD5: `8e83ca70e441ab06c318d82300c84806` (verified against rembg's declared checksum).

Runtime: ONNX Runtime Web 1.20.1, local WASM, one thread. Preprocessing follows rembg U2netpSession (320 × 320, ImageNet channel normalization).

All files ship with the Android app. Photos are processed on the device. Small foregrounds, fur and complex backgrounds may need manual edge correction; this is foreground segmentation, not a guarantee of perfect cat segmentation.
