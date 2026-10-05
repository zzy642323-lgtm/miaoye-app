package com.miaoye.journal;
import java.io.*;
import java.util.zip.*;

/** Fallback for devices whose AssetManager cannot open a packaged web asset. */
public final class LocalPages {
  public static InputStream open(String apkPath, String path) throws IOException {
    if (!path.startsWith("web/") || path.contains("..") || path.contains("\\")) throw new IOException("Invalid local page path");
    final ZipFile apk = new ZipFile(apkPath);
    ZipEntry entry = apk.getEntry("assets/" + path);
    if (entry == null || entry.isDirectory()) { apk.close(); throw new FileNotFoundException(path); }
    try {
      return new FilterInputStream(apk.getInputStream(entry)) {
        @Override public void close() throws IOException { try { super.close(); } finally { apk.close(); } }
      };
    } catch (IOException e) { apk.close(); throw e; }
  }
}
