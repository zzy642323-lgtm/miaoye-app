package com.miaoye.journal;
import android.content.Context;import java.io.*;import java.net.*;import java.security.*;import java.util.*;
public final class RemoteAssets {
private static final Map<String,String> HASHES=new HashMap<>();static{HASHES.put("assets/adventure-0-10-v9.webp","9b30bd291943213c91528012d341db57d0933ba7346deffc6d869781e163875f");
HASHES.put("assets/adventure-0-2-v9.webp","f5e634ac288f45817f7939469daf4e936a0f9e7e0efdb1ad6d793cffbcc454b9");
HASHES.put("assets/adventure-0-3-v9.webp","ca37fc13e888aeab03e706b7192a8d005306ec88ca900f526d8138fd706a67b9");
HASHES.put("assets/adventure-0-4-v9.webp","95b860bf4ac5de11a4453fa519c0b810a19a2d5c28142c2d5a98229a650cb08d");
HASHES.put("assets/adventure-0-5-v9.webp","2cd99d80caa5e38aad60d1e79d354ddca4b774b74eb1c388d4ea1ef5c08f7942");
HASHES.put("assets/adventure-0-6-v9.webp","80287b2aa66446a57ebf158327d2ea5aaed332e0c8575c14ea884d776fbf9358");
HASHES.put("assets/adventure-0-7-v9.webp","5fe9c868b36f92d6fa5c14b10f95dd57431e90be634e2753f602368470bcea8e");
HASHES.put("assets/adventure-0-8-v9.webp","c05b78c71d18b1a6f5bd4d29119fa3b26c9f8ce845b8841100cfb124721b3806");
HASHES.put("assets/adventure-0-9-v9.webp","02f1637bef210d85721996c184ab5e8088afb851b53370560cfb05950973f9d6");
HASHES.put("assets/adventure-0-v8.webp","6aba6b05ab4420e331b764973d7116d8b27269b8c0c4318ab96a8c3b99bf7d38");
HASHES.put("assets/adventure-1-10-v9.webp","26e12713a75e9118e6720de3404a790d26ac7952c711ca5fa005eb1a1e169bf5");
HASHES.put("assets/adventure-1-2-v9.webp","0967fdf7fa3ff930ad908bfb2709f20f73165ca55a624968dbd15aca5e4e1042");
HASHES.put("assets/adventure-1-3-v9.webp","bb4f2c51622e31b937be43ea798fe622657bd871545317d8d38fc8782fe26852");
HASHES.put("assets/adventure-1-4-v9.webp","227e5b3025f98350437fff11df75d0dc1eec4400d20a75d6281fe53657450220");
HASHES.put("assets/adventure-1-5-v9.webp","b7bca4ca187f1a9f6a4e007572ba33804758b27f3d13bf2ade74e4df25861776");
HASHES.put("assets/adventure-1-6-v9.webp","4ec38ad4e59a383db378a444e87cce32e0bdc2e15e72919a44b9fff37929aa3b");
HASHES.put("assets/adventure-1-7-v9.webp","2ba5c646f16fa0a4a26e1a55d9f6db01db692a5a794ff888e865538e1e4f1621");
HASHES.put("assets/adventure-1-8-v9.webp","7fdee04be743f21ce5c84edef01a9d8dcfea1e46cb8a11136fe7e95e5b2910e9");
HASHES.put("assets/adventure-1-9-v9.webp","d1369e8c36c2a3b093bd209c3fa513990c68d920db4b751a00a972ee6ed4330e");
HASHES.put("assets/adventure-1-v8.webp","354c73be2a69d77841f5a4483e519c791adfe97f1e35cd0df9f97cebea355bb6");
HASHES.put("assets/adventure-2-10-v9.webp","080799358caaa0942c753be20af15f5a2b1b718232558eafb0d1896241acb359");
HASHES.put("assets/adventure-2-2-v9.webp","255d02b15c66d3d3f4911e13dfe4201815c238cc31d99e85c2fcd927e06498a8");
HASHES.put("assets/adventure-2-3-v9.webp","b744dac7f24ecf4d7413db416504373d09c8067268fd940f6bd261cc3e8c36c6");
HASHES.put("assets/adventure-2-4-v9.webp","b545c361a6f05d1da50cccc5ce39116dd6b8e3afcfca596b1374c1b44d220e06");
HASHES.put("assets/adventure-2-5-v9.webp","cfbc80f9ca508639cb58e512fc9d43a790cab95cd296d8f292682d3c8aaeb468");
HASHES.put("assets/adventure-2-6-v9.webp","cd2d6498503c4511a5e1735fe23671777cf267a0fd2f2c6043f13cb5ca95756a");
HASHES.put("assets/adventure-2-7-v9.webp","eb7a894352c40d5774b65e3f840e5cdfc2ba6310cf4ec389cd4318c304e1167f");
HASHES.put("assets/adventure-2-8-v9.webp","09f701d6664afa42ff52ffdf774e938460a018ac8ba2f704ea587619d94446a7");
HASHES.put("assets/adventure-2-9-v9.webp","7435fddc40a988c6a31e4ec2c69584031960b1621b344aca0579dcd970cd721b");
HASHES.put("assets/adventure-2-v8.webp","a0abcfa57338cd42126154bffdd4f143de77b8fbb67770360ea6c9b576fb2e65");
HASHES.put("assets/adventure-3-10-v9.webp","11f20a154c8a1c18a193979f302c796ab37826e055f898f9052bdfa8263b61a8");
HASHES.put("assets/adventure-3-2-v9.webp","0f94e3a9d502f0fc1af4ee979c7d8bd3e9b369d88716030ef98cfa90ba4e330b");
HASHES.put("assets/adventure-3-3-v9.webp","7d0e409f37945c0955c23cdd3753f247c64502c7007af21a325388f0cc41bfe9");
HASHES.put("assets/adventure-3-4-v9.webp","990780762a0e06e06ce6e7caf7a8d4ff520a4a7e75093e347315f4479b61da41");
HASHES.put("assets/adventure-3-5-v9.webp","246dee21104041cd9c3e2b2b85e070b2633b6eb754324acac7d326cb6a241434");
HASHES.put("assets/adventure-3-6-v9.webp","497eeb7b79039485b0946e9a86788620fd2537aba9221bcd68726517b1043e2c");
HASHES.put("assets/adventure-3-7-v9.webp","f9de3eba646b919c3f1addaf2d8b23ce01d820c439fc045730c5a1c2ee39b1b5");
HASHES.put("assets/adventure-3-8-v9.webp","27f4be97004da801f50e6a8139456a56b8663f59533ba1a15e7fe98d3b89b7c7");
HASHES.put("assets/adventure-3-9-v9.webp","1c98e2425180889a3202c5dbd75e373f5bdf603f23baaf8337f8c42a11aa4579");
HASHES.put("assets/adventure-3-v8.webp","15aa0284a8b66c72a05e263dd30289ef0200c45cc09820ee23d9105ce6514f6f");
HASHES.put("assets/adventure-4-10-v9.webp","5494df812ff48b2354b49cd5d1fae30ad8b8bfc214dad434b1ddf30a3e75a2e7");
HASHES.put("assets/adventure-4-2-v9.webp","043598ce0fd18f37d68232195b157822472b8c8eae219aa52597bc733ab68a29");
HASHES.put("assets/adventure-4-3-v9.webp","b8319b59570a911a90223c7f02cf31f8a93262335f37bf73cfdc550e5dc5bd6d");
HASHES.put("assets/adventure-4-4-v9.webp","4dbdb789119a17d05183ff18bfd4ba26c372613481f2465b4519ab977b995006");
HASHES.put("assets/adventure-4-5-v9.webp","24f66304f43571bc0178496eb6bec21bf630de327c4f335ec826128666f36365");
HASHES.put("assets/adventure-4-6-v9.webp","81849f37833c76db0838dd25dbdc5f28c1df82b7102f73baf898e6baa4b697eb");
HASHES.put("assets/adventure-4-7-v9.webp","d4b327b31a9cfff7d4252edec468b4d4b553fbda76bee7b9ad6c1ed7cedb6491");
HASHES.put("assets/adventure-4-8-v9.webp","2fef6f189dc6fa6917c5e862570bd3ea40ba7d970a3564231e3baed1ee269b34");
HASHES.put("assets/adventure-4-9-v9.webp","f97b552fa4f28cbe602b5bd5fee8d8d6c67dfafedde9d70902f21374d6abbada");
HASHES.put("assets/adventure-4-v8.webp","5865f5a4acf874e282d577d300f9551da4733d8c349e9a5251b25987e2e9e77c");
HASHES.put("engine/models/u2netp.onnx","309c8469258dda742793dce0ebea8e6dd393174f89934733ecc8b14c76f4ddd8");
HASHES.put("engine/vendor/ort-wasm-simd-threaded.wasm","207d02be4591c156b0a98f024f3d58005b5b04c92274d759fb390338c63559ea");
HASHES.put("engine/vendor/ort-wasm-simd-threaded.mjs","745eb7c0ce6f18a6aa521971b2877babc7ffb27eecb58ab3bc6e5ef4692672e8");
HASHES.put("engine/vendor/ort.wasm.min.js","e66568724f8848e57cc2a56e4bea3a5b86ce3ff81b2da11eac8ed7ab02b27bd4");}
public static String remotePath(String local){if(!local.startsWith("web/"))return null;String name=local.substring(4);if(!HASHES.containsKey(name))return null;return name.startsWith("engine/")?name.substring(7):name;}
private static String digest(File file)throws IOException{try{MessageDigest sha=MessageDigest.getInstance("SHA-256");try(InputStream in=new FileInputStream(file)){byte[] b=new byte[8192];int n;while((n=in.read(b))!=-1)sha.update(b,0,n);}StringBuilder s=new StringBuilder();for(byte b:sha.digest())s.append(String.format("%02x",b&255));return s.toString();}catch(NoSuchAlgorithmException e){throw new IOException(e);}}
public static synchronized InputStream open(Context context,String local)throws IOException{String remote=remotePath(local);if(remote==null)throw new FileNotFoundException(local);String expected=HASHES.get(local.substring(4));File folder=new File(context.getFilesDir(),"downloaded-assets-v1");folder.mkdirs();File cached=new File(folder,expected);if(cached.isFile()&&expected.equals(digest(cached)))return new FileInputStream(cached);File temp=File.createTempFile("download-",".tmp",folder);HttpURLConnection connection=(HttpURLConnection)new URL("https://s7ianzbg94fw.meoo.run/"+remote).openConnection();connection.setConnectTimeout(15000);connection.setReadTimeout(60000);connection.setInstanceFollowRedirects(false);try{if(connection.getResponseCode()!=200)throw new IOException("Asset download failed");long total=0;try(InputStream in=connection.getInputStream();OutputStream out=new FileOutputStream(temp)){byte[] b=new byte[8192];int n;while((n=in.read(b))!=-1){total+=n;if(total>20*1024*1024)throw new IOException("Asset too large");out.write(b,0,n);}}if(!expected.equals(digest(temp)))throw new IOException("Asset checksum mismatch");if(!temp.renameTo(cached))throw new IOException("Cache write failed");return new FileInputStream(cached);}finally{connection.disconnect();temp.delete();}}
}
