package com.miaoye.journal;
import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.webkit.*;
import android.util.Base64;
import android.widget.Toast;
import java.io.*;
import java.util.*;
public final class MainActivity extends Activity {
  private WebView web;
  private ValueCallback<Uri[]> chooser;
  private byte[] exportBytes;
  private Uri cameraUri;
  private static final String HOST=LocalRequests.HOST;
  @Override public void onCreate(Bundle b){super.onCreate(b);getWindow().setStatusBarColor(0xfffaf8ec);getWindow().setNavigationBarColor(0xffeef0d8);web=new WebView(this);android.widget.FrameLayout frame=new android.widget.FrameLayout(this);frame.addView(web,new android.widget.FrameLayout.LayoutParams(-1,-1));frame.setOnApplyWindowInsetsListener(new android.view.View.OnApplyWindowInsetsListener(){public android.view.WindowInsets onApplyWindowInsets(android.view.View v,android.view.WindowInsets insets){v.setPadding(insets.getSystemWindowInsetLeft(),insets.getSystemWindowInsetTop(),insets.getSystemWindowInsetRight(),insets.getSystemWindowInsetBottom());return insets;}});setContentView(frame);web.addJavascriptInterface(new Object(){@JavascriptInterface public void savePng(final String url){runOnUiThread(new Runnable(){public void run(){if(web.getUrl()!=null&&web.getUrl().startsWith("https://"+HOST+"/"))savePngUrl(url);}});}},"MiaoyeExport");WebSettings settings=web.getSettings();settings.setJavaScriptEnabled(true);settings.setDomStorageEnabled(true);settings.setAllowFileAccess(false);settings.setAllowContentAccess(true);settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);web.setWebViewClient(new WebViewClient(){
    @Override public WebResourceResponse shouldInterceptRequest(WebView view,WebResourceRequest request){Uri u=request.getUrl();LocalRequests.Route route=LocalRequests.route(u.getScheme(),u.getHost(),u.getPath());if(route==LocalRequests.Route.EMBEDDED)return null;if(route==LocalRequests.Route.CLOUD && (u.getPort()==-1||u.getPort()==443))return null;if(route==LocalRequests.Route.BLOCKED)return new WebResourceResponse("text/plain","UTF-8",403,"Offline App",Collections.emptyMap(),new ByteArrayInputStream(new byte[0]));String path=LocalRequests.pagePath(u.getPath());if(path.startsWith("/api/")){String json=path.equals("/api/me")?"{\"authenticated\":false}":"{\"error\":\"安卓本机版暂未开放云同步服务\"}";return new WebResourceResponse("application/json","UTF-8",200,"OK",Collections.singletonMap("Cache-Control","no-store"),new ByteArrayInputStream(json.getBytes(java.nio.charset.StandardCharsets.UTF_8)));}try{String type=(path.endsWith(".js")||path.endsWith(".mjs"))?"text/javascript":path.endsWith(".css")?"text/css":path.endsWith(".html")?"text/html":path.endsWith(".webp")?"image/webp":path.endsWith(".png")?"image/png":path.endsWith(".wasm")?"application/wasm":path.endsWith(".ttf")?"font/ttf":"application/octet-stream";Map<String,String> h=new HashMap<>();h.put("Cache-Control","no-cache");h.put("Access-Control-Allow-Origin","https://"+HOST);return new WebResourceResponse(type,type.startsWith("text/")?"UTF-8":null,200,"OK",h,openLocalAsset("web"+path));}catch(IOException e){return new WebResourceResponse("text/plain","UTF-8",404,"Not Found",Collections.emptyMap(),new ByteArrayInputStream(new byte[0]));}}
    @Override public boolean shouldOverrideUrlLoading(WebView v,WebResourceRequest r){Uri u=r.getUrl();LocalRequests.Route route=LocalRequests.route(u.getScheme(),u.getHost(),u.getPath());if(route==LocalRequests.Route.LOCAL||route==LocalRequests.Route.EMBEDDED)return false;if("https".equals(u.getScheme())||"http".equals(u.getScheme())){try{startActivity(new Intent(Intent.ACTION_VIEW,u));}catch(Exception e){Toast.makeText(MainActivity.this,"无法打开外部链接",Toast.LENGTH_SHORT).show();}}return true;}
  });web.setWebChromeClient(new WebChromeClient(){
    @Override public boolean onShowFileChooser(WebView v,ValueCallback<Uri[]> callback,FileChooserParams params){
      if(chooser!=null)chooser.onReceiveValue(null);chooser=callback;
      try {
        if(params.isCaptureEnabled()){
          File folder=new File(getCacheDir(),"camera");folder.mkdirs();
          File photo=File.createTempFile("capture-",".jpg",folder);
          cameraUri=new Uri.Builder().scheme("content").authority(getPackageName()+".camera").appendPath(photo.getName()).build();
          Intent camera=new Intent(android.provider.MediaStore.ACTION_IMAGE_CAPTURE);
          camera.putExtra(android.provider.MediaStore.EXTRA_OUTPUT,cameraUri);
          camera.addFlags(Intent.FLAG_GRANT_WRITE_URI_PERMISSION|Intent.FLAG_GRANT_READ_URI_PERMISSION);
          camera.setClipData(android.content.ClipData.newRawUri("喵页拍照",cameraUri));
          startActivityForResult(camera,3);
        } else {
          cameraUri=null;
          Intent photos;
          if(android.os.Build.VERSION.SDK_INT>=33){
            photos=new Intent(android.provider.MediaStore.ACTION_PICK_IMAGES);
            photos.setType("image/*");
            if(params.getMode()==FileChooserParams.MODE_OPEN_MULTIPLE)photos.putExtra(android.provider.MediaStore.EXTRA_PICK_IMAGES_MAX,Math.min(20,android.provider.MediaStore.getPickImagesMaxLimit()));
          }else{
            photos=new Intent(Intent.ACTION_GET_CONTENT);photos.addCategory(Intent.CATEGORY_OPENABLE);photos.setType("image/*");
            photos.putExtra(Intent.EXTRA_ALLOW_MULTIPLE,params.getMode()==FileChooserParams.MODE_OPEN_MULTIPLE);
          }
          try{startActivityForResult(photos,1);}catch(android.content.ActivityNotFoundException unavailable){
            Intent fallback=new Intent(Intent.ACTION_OPEN_DOCUMENT);fallback.addCategory(Intent.CATEGORY_OPENABLE);fallback.setType("image/*");fallback.putExtra(Intent.EXTRA_ALLOW_MULTIPLE,true);startActivityForResult(fallback,1);
          }
        }
      }catch(Exception e){chooser.onReceiveValue(null);chooser=null;cameraUri=null;Toast.makeText(MainActivity.this,params.isCaptureEnabled()?"无法启动相机，请从相册添加照片":"无法打开相册，请重试",Toast.LENGTH_LONG).show();}
      return true;
    }
  });
  web.setDownloadListener(new DownloadListener(){public void onDownloadStart(String url,String ua,String cd,String type,long len){savePngUrl(url);}});loadLocalHome();}
  private InputStream openLocalAsset(String path) throws IOException {try{return getAssets().open(path);}catch(IOException assetError){return LocalPages.open(getApplicationInfo().sourceDir,path);}}
  private void loadLocalHome(){web.loadUrl(LocalRequests.HOME_URL);}
  private void savePngUrl(String url){if(!url.startsWith("data:image/png;base64,")||url.length()>24000000)return;try{exportBytes=Base64.decode(url.substring(url.indexOf(',')+1),Base64.DEFAULT);Intent i=new Intent(Intent.ACTION_CREATE_DOCUMENT);i.addCategory(Intent.CATEGORY_OPENABLE);i.setType("image/png");i.putExtra(Intent.EXTRA_TITLE,"喵页-手账-"+System.currentTimeMillis()+".png");startActivityForResult(i,2);}catch(Exception e){Toast.makeText(this,"导出失败，请重试",Toast.LENGTH_SHORT).show();}}
  @Override protected void onActivityResult(int code,int result,Intent data){super.onActivityResult(code,result,data);if(code==1&&chooser!=null){List<Uri> files=new ArrayList<>();if(result==RESULT_OK&&data!=null){if(data.getClipData()!=null)for(int n=0;n<data.getClipData().getItemCount();n++)files.add(data.getClipData().getItemAt(n).getUri());else if(data.getData()!=null)files.add(data.getData());}chooser.onReceiveValue(files.isEmpty()?null:files.toArray(new Uri[0]));chooser=null;}if(code==3&&chooser!=null){Uri captured=cameraUri;cameraUri=null;chooser.onReceiveValue(result==RESULT_OK&&captured!=null?new Uri[]{captured}:null);chooser=null;}if(code==2&&result==RESULT_OK&&data!=null&&exportBytes!=null){try(OutputStream out=getContentResolver().openOutputStream(data.getData())){out.write(exportBytes);Toast.makeText(this,"手账图片已保存",Toast.LENGTH_SHORT).show();}catch(Exception e){Toast.makeText(this,"保存失败",Toast.LENGTH_SHORT).show();}finally{exportBytes=null;}}}
  @Override public void onBackPressed(){web.evaluateJavascript("(()=>{let d=document.querySelector('dialog[open]');if(d){if(d.dispatchEvent(new Event('cancel',{cancelable:true}))&&d.open)d.close();return true;}if(document.body.classList.contains('editing-mode')){document.querySelector('[data-action=home]').click();return true;}return false;})()",new ValueCallback<String>(){public void onReceiveValue(String value){if(!"true".equals(value))MainActivity.super.onBackPressed();}});}
  @Override protected void onDestroy(){if(chooser!=null)chooser.onReceiveValue(null);web.destroy();super.onDestroy();}
}
