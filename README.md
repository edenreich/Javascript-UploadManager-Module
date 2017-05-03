<p align="center"><img src="https://s30.postimg.org/3x42fl5g1/Upload_Manager.jpg"></p>

# Javascript-UploadManager-Module
A Module to handle multiple files upload on the Client-Side, to handle it on the Server-Side you could use Upload.class.php

### Import the script
All you need is just the UploadManager.js, download it and add it to your assets folder and link it to your view page.

### Instatiate a new UploadManager Object
Create a new instance of Upload Manager and assign it to a variable::
```javascript
var uploadManager = new UploadManager;
```
### Configuration
Use the following setting to configure the look of your button however you want
```javascript
uploadManager.settings({
		bindTo: '.upload',
		dragAndDrop: true,
		buttonOnThe: 'left',
		dropBoxTitle: 'Drop your files here...',
		URL: 'Upload.php',
		autoStart: false,
		animateProgressBar: true,
		showPrecentage: true,
		progressBarColor: '#186680',
		success: function(response) {
			
			console.log(response);
		},
		error: function(response) {

			// console.log(response);
		},
		allAtOnce: false,
		titleFontFamily: 'arial',
});
```

please note that if you do not give an specific bindTo options the object will look for an element with a class of 'upload' and will try to bind itself to it.

## Notes
please feel free to send any pull request or suggesstions to improve it :-) 


