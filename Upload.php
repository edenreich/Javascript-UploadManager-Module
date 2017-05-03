<?php

header('Content-Type: multipart/form-data');

echo 'successfuly uploaded ' . print_r($_FILES['file'], true);

sleep(1);

?>