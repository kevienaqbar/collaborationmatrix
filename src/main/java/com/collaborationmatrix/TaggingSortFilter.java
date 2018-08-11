package com.collaborationmatrix;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 *
 * @author Kevien Aqbar
 */
public class TaggingSortFilter {

    void setData(ArrayList<String> arrComb, ArrayList<Integer> arrCombVal, ArrayList<String> arrCombKey, ArrayList<String> authortampil, ArrayList<Integer> sourcelisttampil, ArrayList<Integer> targetlisttampil, ArrayList<Integer> valuelisttampil, ArrayList<String> keywordlisttampil) {

        // Init the element list
        List<ElementTag> elements = new ArrayList<ElementTag>();
        for (int i = 0; i < arrCombVal.size(); i++) {
            elements.add(new ElementTag(i, arrCombVal.get(i))); //Buat elemen list sebanyak arrCombVal, indexnya, sama valuenya di tagging
        }

        //Urutkan list elements, DESC
        Collections.sort(elements, Collections.reverseOrder());

        //Filter Jumlah Kolaborasi Yang Ingin Ditampilkan
        List<ElementTag> filter = new ArrayList<ElementTag>(elements.subList(0, 25)); //Membatasi hanya 25 kolaborasi data teratas
//        System.out.println("\nHasil Filter Top 25 Collaboration"); //###BUKA
//        System.out.println("NilDESC - IdxBef"); //###BUKA
        for (ElementTag element : filter) {
            //System.out.println(element.value + "      -  " + element.index);  //###BUKA
//            System.out.println("Value : " + element.value + " || Idx-" + element.index);  //###BUKA
            //Jalankan Method getConvert (persiapan data json. Rubah array ke node dan link
            SetNodesLinks setNodesLinks = new SetNodesLinks();
            setNodesLinks.getConvert(element.value, element.index, arrComb, arrCombKey,
                    authortampil, sourcelisttampil, targetlisttampil, valuelisttampil, keywordlisttampil);
        }
    }
}
