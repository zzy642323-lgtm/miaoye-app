package com.miaoye.journal;
import android.content.ContentProvider;
import android.content.ContentValues;
import android.database.Cursor;
import android.database.MatrixCursor;
import android.net.Uri;
import android.os.ParcelFileDescriptor;
import android.provider.OpenableColumns;
import java.io.File;
import java.io.FileNotFoundException;

/** Grants the system camera access only to temporary JPEG files in our cache. */
public final class CameraProvider extends ContentProvider {
  public boolean onCreate(){return true;}
  private File photo(Uri uri) throws FileNotFoundException {
    String name=uri.getLastPathSegment();
    if(name==null||!name.matches("capture-[A-Za-z0-9_-]+\\.jpg"))throw new FileNotFoundException("Invalid photo");
    return new File(new File(getContext().getCacheDir(),"camera"),name);
  }
  public ParcelFileDescriptor openFile(Uri uri,String mode) throws FileNotFoundException {
    return ParcelFileDescriptor.open(photo(uri),ParcelFileDescriptor.parseMode(mode));
  }
  public String getType(Uri uri){return "image/jpeg";}
  public Cursor query(Uri uri,String[] projection,String selection,String[] args,String sort){
    try {File file=photo(uri);String[] columns=projection==null?new String[]{OpenableColumns.DISPLAY_NAME,OpenableColumns.SIZE}:projection;MatrixCursor c=new MatrixCursor(columns);Object[] row=new Object[columns.length];for(int i=0;i<columns.length;i++)row[i]=OpenableColumns.DISPLAY_NAME.equals(columns[i])?file.getName():OpenableColumns.SIZE.equals(columns[i])?file.length():null;c.addRow(row);return c;}catch(Exception e){return null;}
  }
  public Uri insert(Uri u,ContentValues v){throw new UnsupportedOperationException();}
  public int update(Uri u,ContentValues v,String s,String[] a){throw new UnsupportedOperationException();}
  public int delete(Uri u,String s,String[] a){throw new UnsupportedOperationException();}
}
