<?php
    // function getImageFiles($dir_name, $ext){
        // $filelist = scandir($dir_name);
        // $extLowercase = array();
        // $output = [];
        // foreach ($ext as $val){
            // array_push($extLowercase,strtolower($val));
        // }
        
        // foreach ($filelist as $val) {
            // $filename = $dir_name.$val;
            // if (is_file($filename)){
                // $path_parts = pathinfo($filename);
                // if(in_array(strtolower($path_parts['extension']),$extLowercase)){
                    // array_push($output,$filename);
                // }
            // }
        // }
        // echo json_encode($output);
    // }
    
    //$dir_name = $_GET["dir_name"];
    //$ext = json_decode($_GET["ext"]);
	
    echo json_encode(glob($_GET["dir_name"].'*.{png,jpg,gif}',GLOB_BRACE));
    //getImageFiles($dir_name, $ext);
?>

