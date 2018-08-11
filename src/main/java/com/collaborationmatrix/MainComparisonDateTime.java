package com.collaborationmatrix;

import com.google.gson.Gson;
import java.io.BufferedReader;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;
import java.io.Serializable;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Timestamp;
import javax.faces.bean.ManagedBean;
import javax.faces.bean.SessionScoped;

/**
 *
 * @author Kevien Aqbar
 */
@ManagedBean(name = "CompareDateTime")
@SessionScoped
public class MainComparisonDateTime implements Serializable {

    static Timestamp lastexportimedb, datetimejson;

  //Pengaturan Koneksi Database RIN (NamaDb, User, Pass)
    public static String URL = "jdbc:postgresql://127.0.0.1:5432/rin_lipi";
    public static String USER = "dvndb";
    public static String PASS = "pd11l1p12016";
//
//    //Jika ingin connect ke localhost komputer local   
//    public static String URL = "jdbc:postgresql://localhost:5432/rin_lipi.sqlnew";
//    public static String USER = "postgres";
//    public static String PASS = "root";

    public void Compare() {

        try {
            Class.forName("org.postgresql.Driver");
        } catch (ClassNotFoundException e) {
            e.printStackTrace();
        }

        try {
            Connection conn = DriverManager.getConnection(URL, USER, PASS);
            Statement st = conn.createStatement();
            ResultSet rs = st.executeQuery("SELECT MAX(lastexporttime) FROM dataset"); //Get Last Transaction DateTime in Database
            while (rs.next()) {
                lastexportimedb = rs.getTimestamp(1);

                //Cek kondisi DateTimeStamp di JSON vs Database
                Gson gson = new Gson();
                BufferedReader br = null;
                try {
                    //Setting location path file .json (ex: datajson_auth.json)
                    br = new BufferedReader(new FileReader("/usr/local/glassfish4/glassfish/domains/domain1/applications/dataverse-4.8.6/collaborationmatrix/src/main/webapp/resources/data/datajson_auth.json"));
//                    br = new BufferedReader(new FileReader("E:\\collaborationmatrix\\src\\main\\webapp\\resources\\data\\datajson_auth.json"));
//                    br = new BufferedReader(new FileReader("..\\..\\..\\..\\webapp\\resources\\data\\data_auth.json"));
                    Result result = gson.fromJson(br, Result.class);
                    datetimejson = Timestamp.valueOf(result.getDatejson());
                    System.out.println("DateTimeStamp in Database  : " + lastexportimedb);
                    System.out.println("DateTimeStamp in JSON File : " + datetimejson);
                    boolean a = lastexportimedb.after(datetimejson); //Apakah DateTime pada lastexporttime (DB) lebih dari yg tercantum pada File .JSON ? --true : Maka lakukan pembaruan file JSON.
                    System.out.println("Result Compare is AfterTime & Will being Update JSON file : " + a); //Jika true, maka jalankan Main java
                    if (a) { //Jika True, Jalankan Ulang Proses Operasi Kolaborasi & Re-Create File JSON 
                        InitCollaboration main = new InitCollaboration();
                        main.AuthorKeyword(lastexportimedb, URL, USER, PASS);
                    }
                } catch (FileNotFoundException e) {
                    e.printStackTrace();
                } finally {
                    if (br != null) {
                        try {
                            br.close();
                        } catch (IOException e) {
                            e.printStackTrace();
                        }
                    }
                }
            }
        } catch (SQLException es) {
            es.printStackTrace();
        }
    }
}
