package com.miaoye.journal;
import android.content.ContentValues;
import android.content.Context;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.provider.MediaStore;
import java.io.*;

final class GalleryExport {
  static void save(Context context,byte[] bytes)throws IOException {
    android.graphics.BitmapFactory.Options options=new android.graphics.BitmapFactory.Options();options.inJustDecodeBounds=true;
    android.graphics.BitmapFactory.decodeByteArray(bytes,0,bytes.length,options);
    if(options.outWidth<=0||options.outHeight<=0||!"image/png".equals(options.outMimeType))throw new IOException("Invalid image");
    String name="喵页-手账-"+System.currentTimeMillis()+"-"+java.util.UUID.randomUUID().toString().substring(0,8)+".png";
    if(Build.VERSION.SDK_INT>=29){
      ContentValues values=new ContentValues();values.put(MediaStore.Images.Media.DISPLAY_NAME,name);values.put(MediaStore.Images.Media.MIME_TYPE,"image/png");
      values.put(MediaStore.Images.Media.RELATIVE_PATH,Environment.DIRECTORY_PICTURES+"/喵页");values.put(MediaStore.Images.Media.IS_PENDING,1);
      Uri uri=context.getContentResolver().insert(MediaStore.Images.Media.EXTERNAL_CONTENT_URI,values);
      if(uri==null)throw new IOException("Cannot create image");
      try{try(OutputStream out=context.getContentResolver().openOutputStream(uri)){if(out==null)throw new IOException("Cannot write image");out.write(bytes);}
        ContentValues ready=new ContentValues();ready.put(MediaStore.Images.Media.IS_PENDING,0);if(context.getContentResolver().update(uri,ready,null,null)<1)throw new IOException("Cannot publish image");
      }catch(Exception error){context.getContentResolver().delete(uri,null,null);throw new IOException("Gallery save failed",error);}
    }else{
      File folder=new File(Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_PICTURES),"喵页");if(!folder.isDirectory()&&!folder.mkdirs())throw new IOException("Cannot create album");
      File photo=new File(folder,name);try(OutputStream out=new FileOutputStream(photo)){out.write(bytes);}catch(IOException error){photo.delete();throw error;}
      android.media.MediaScannerConnection.scanFile(context,new String[]{photo.getAbsolutePath()},new String[]{"image/png"},null);
    }
  }
}
