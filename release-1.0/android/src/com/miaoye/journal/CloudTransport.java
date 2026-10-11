package com.miaoye.journal;
import java.io.*;
import java.net.*;
import java.nio.charset.StandardCharsets;
import javax.net.ssl.HttpsURLConnection;
import org.json.JSONObject;
/** Restricted HTTPS transport; no platform administrator credentials or shared cookies. */
public final class CloudTransport {
 public static boolean allowed(String value){
  return LocalRequests.cloudURL(value);
 }
 public static JSONObject request(String value,String method,String headers,String body){
  HttpsURLConnection connection=null;JSONObject result=new JSONObject();
  try{
   if(!allowed(value)||!java.util.Arrays.asList("GET","POST","PUT","DELETE","PATCH").contains(method))throw new IOException("不支持的云请求");
   byte[] bytes=body.getBytes(StandardCharsets.UTF_8);if(bytes.length>52428800)throw new IOException("备份超过 50 MB");
   connection=(HttpsURLConnection)new URL(value).openConnection();connection.setInstanceFollowRedirects(false);connection.setConnectTimeout(20000);connection.setReadTimeout(60000);connection.setRequestMethod(method);
   JSONObject input=new JSONObject(headers);
   for(String key:new String[]{"Authorization","Content-Type","Prefer","X-Upsert"})if(input.has(key))connection.setRequestProperty(key,input.getString(key));
   if(bytes.length>0){connection.setDoOutput(true);connection.setFixedLengthStreamingMode(bytes.length);try(OutputStream output=connection.getOutputStream()){output.write(bytes);}}
   int status=connection.getResponseCode();if(status>=300&&status<400)throw new IOException("云端地址发生跳转，请更新应用后重试");
   ByteArrayOutputStream output=new ByteArrayOutputStream();InputStream stream=status>=400?connection.getErrorStream():connection.getInputStream();
   if(stream!=null)try(InputStream inputStream=stream){byte[] buffer=new byte[8192];int count;while((count=inputStream.read(buffer))!=-1){if(output.size()+count>52428800)throw new IOException("云响应超过大小限制");output.write(buffer,0,count);}}
   result.put("status",status);result.put("body",new String(output.toByteArray(),StandardCharsets.UTF_8));
  }catch(Exception e){try{result.put("status",0);result.put("error",e instanceof java.net.SocketTimeoutException?"连接云服务超时，请稍后重试（原生 HTTPS）":e instanceof javax.net.ssl.SSLException?"云连接证书验证失败，请检查手机日期和系统更新":e instanceof java.net.UnknownHostException?"暂时无法解析云服务地址，请稍后重试":"云服务连接中断，请稍后重试（原生 HTTPS）");}catch(Exception ignored){}}
  finally{if(connection!=null)connection.disconnect();}return result;
 }
}
