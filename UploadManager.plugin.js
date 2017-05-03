
/*
|--------------------------------------------------------------------------
| UploadManager Module JS
|--------------------------------------------------------------------------
| This Javascript Module creates an Upload Manager
| 
| 
*/

(function()
{
	/**
	 * stores the dropbox element where the users drop their files.
	 */
	var dropBox = {};	
	
	/**
	 * stores the dropbox inside text.
	 */
	var dropBoxTitle = {};

	/**
	 * stores the all the items that has been listed and need to be upload ("pre-upload-lists").
	 */
	var uploadListItems = [];
	
	/**
	 * stores an input with the name of file[], and make it multiple.
	 */
	var fileInput = {};
	
	/**
	 * stores the button where the user clicks to choose the files.
	 */
	var chooseButton = {};
	
	/**
	 * stores the container - is basicly the element which we attach the upload manager to.
	 */
	var container = {};

	/**
	 * stores the style tag, to add some bootstrap pretty progressbar style later.
	 */
	var styleTags = {};

	/**
	 * stores the settings of the upload manager.
	 */
	var settings = {};

	/**
	 * store the default settings.
	 */
	var defaults = {
			dragAndDrop: false,
			dropBoxTitle: 'Drag Images Here..',
			containerWidth: 'auto',
			containerHeight: 200,
			attachTo: '.upload',
			buttonOnThe: 'right',
			buttonInnerText: 'Choose',
			URL: 'Upload.php',
			autoStart: false,
			success: function(response) {},
			error: function(response) {},
			animateProgressBar: false,
			progressBarColor: '#337ab7',
			showPrecentage: true,
			allAtOnce: false,
		}

	/**
	 * The constructor:
	 * - checks if the developer passed an object as the settings.
	 * - extending the default settings and override them.
	 */
	this.UploadManager = function() {

		settings = defaults;

		if(arguments[0] && typeof arguments[0] === "object") {

			settings = extendDefaults(defaults, arguments[0]);	
		}
	}

	/**
	 * This method create the upload manager and attach it to the selected element.
	 */
	UploadManager.prototype.attachTo = function(div) {

		// store the attached element
		container = document.querySelector(div);

		// add the dropbox if it was requested
		if(settings.dragAndDrop)
		{
			dropBox = createDropBox();

			container.appendChild(dropBox);
			
			//if the developer decided to upload all at once we will give up on listing
			if(settings.allAtOnce) {

				dropBox.ondrop = processFiles;

			} else { // otherwise, we will list the files

				dropBox.ondrop = listFiles;
			}
		}

		fileInput = createFileInput();
		chooseButton = createButton(settings);
		
		//if the developer decided to upload all at once we will give up on listing
		if(settings.allAtOnce) {

			fileInput.onchange = processFiles;

		} else { // otherwise, we will list the files

			fileInput.onchange = listFiles;
		}

		chooseButton.onclick = openFilesDialogBox;
		
		container.appendChild(fileInput);
		container.appendChild(chooseButton);

	}

	/**
	 * This method creates the drag and drop box.
	 */
	function createDropBox() {

		dropBox = document.createElement('div');
		dropBox.className = 'drop-box';
		dropBox.style.width = settings.containerWidth+'px';
		dropBox.style.height = settings.containerHeight+'px';
		dropBox.style.border = '2px dotted #a6a6a6';
		dropBox.style.textAlign = 'center';
		dropBox.style.margin = '0 auto';

		dropBoxTitle = document.createElement('span');
		dropBoxTitle.innerHTML = settings.dropBoxTitle;
		dropBoxTitle.style.lineHeight = settings.containerHeight+'px';
		dropBoxTitle.style.fontSize = '1.6em';
		dropBoxTitle.style.color = '#a6a6a6';

		dropBox.appendChild(dropBoxTitle);
		
		dropBox.ondragover = changeDropBoxStyle;
		dropBox.ondragleave = changeDropBoxStyle;

		return dropBox;
	}

	/**
	 * This function creates the input invisible for the files.
	 */
	function createFileInput() {

		var input = document.createElement('input');

		input.type = 'file';
		input.name = 'file[]';
		input.style.visibility = 'hidden';
		input.id = 'fileInput';
		input.multiple = true;

		return input;
	}

	/**
	 * This function creates the upload button.
	 */
	function createButton(options) {
		
		var button = document.createElement('button');
		
		button.style.display = 'inline-block';
		button.style.padding = '8px 12px';
		button.style.fontSize = '14px';
		button.style.fontWeight = '400';
		button.style.textAlign = 'center';
		button.style.whiteSpace = 'nowrap';
		button.style.verticalAlign = 'middle';
		button.style.userSelect = 'none';
		button.style.backgroundImage = 'none';
		button.style.border = '1px solid transparent';
		button.style.cursor = 'pointer';
		button.style.marginLeft = '10px';
		button.style.marginRight = '10px';
		button.style.backgroundColor = '#257C8A';
		
		if(options.hasOwnProperty('name'))
			button.name = options.name;

		if(options.hasOwnProperty('buttonInnerText'))
			button.innerHTML = options.buttonInnerText;

		if(options.hasOwnProperty('color'))
			button.style.backgroundColor = options.color;

		if(options.hasOwnProperty('buttonOnThe'))
			button.style.float = options.buttonOnThe;

		return button;
	}

	/**
	 * creates the progress bar element, pass animate as true if animate has been set.
	 */
	function createProgressBar(animate) {

		importBootstrapProgressBarStyleTags();

		switch(animate) {

			case true:

				var progressBar = document.createElement('div');
				var div = document.createElement('div');

				progressBar.appendChild(div);

				progressBar.className = 'progress';
				div.className = 'progress-bar progress-bar-striped active';

				break;

			default:
			case false:

				var progressBar = document.createElement('div');
				var div = document.createElement('div');

				progressBar.appendChild(div);

				progressBar.className = 'progress';
				div.className = 'progress-bar progress-bar-striped';

				break;
		}
	
		return progressBar;
	}

	/**
	 * Creates a list item for the being uploaded image.
	 */
	function createListElement() {

		var list = document.createElement('li');

		list.style.width = '98%';
		list.style.height = '40px';
		list.style.lineHeight = '35px';
		list.style.padding = '6px 6px';
		list.style.border = '1px solid #a6a6a6';
		list.style.listStyleType = 'none';
		list.style.marginTop = '5px';
		list.style.display = 'inline-block';

		return list;
	}

	/**
	 * Changes the look of the frame, normally as the user drag something over.
	 */
	function addHighlight() {

		dropBox.style.border = '2px dotted #000000';
		dropBoxTitle.style.color = '#000000';
	}

	/**
	 * simply removes the highlist of the dropbox as the files is being dropped.
	 */
	function removeHighlight() {

		dropBox.style.border = '2px dotted #a6a6a6';
		dropBoxTitle.style.color = '#a6a6a6';
	}

	/**
	 * List the files to be uploaded.
	 */
	function listFiles(files) {

		event.preventDefault();

		if(event.type == 'change') {

			var files = event.target.files;
		}
		else if(event.type == 'drop') {

			var files = event.dataTransfer.files;
		}

		for(var i = 0; i < files.length ; i++) {

			var uploadItem = listFile(files[i]);

			uploadListItems.push(uploadItem);
		}

		for(var i = 0; i < uploadListItems.length; i++)
		{
			container.appendChild(uploadListItems[i]);

			if(settings.autoStart)
				processFile(files[i], uploadListItems[i]);
		}

		return false;
	}

	/**
	 * This function wrap the file inside a list item.
	 */
	function listFile(file) {
		
		var list = createListElement();

		var removeButton = createButton({
								color: '#d9534f', 
								buttonInnerText: 'Remove',
								buttonOnThe: 'right',
								name: 'removeButton',
							});

		var uploadButton = createButton({
								color: '#257C8A', 
								buttonInnerText: 'Upload',
								buttonOnThe: 'right',
							});

		var reader = new FileReader();
		var preview = document.createElement('img');

		preview.style.height = '40px';
		preview.style.width = '40px';
		preview.style.verticalAlign = 'middle';
		preview.style.marginRight = '10px';

		reader.onload = function() {
				
			preview.src = this.result;

		};

		if(file)
		    reader.readAsDataURL(file);		
		else
			preview.src = "";

		var fileName = document.createElement('span');
		fileName.innerHTML = file.name;

		if(!settings.autoStart) {
			
			list.appendChild(preview);		
			list.appendChild(fileName);
			list.appendChild(uploadButton);
			list.appendChild(removeButton);
		
			removeButton.onclick = removeItem;
			uploadButton.onclick = processFile;
			uploadButton.file = file;
		} 

		return list;
	}


	// Event Listeners

	/**
	 * This function changes the color of the drop box.
	 */
	function changeDropBoxStyle(event) {
		
		event.preventDefault();

		if(event.type == "dragover") {

			addHighlight();
		
		} else if(event.type == "dragleave") {

			removeHighlight();
		}

		return false;
	}

	/**
	 * This function processes the files.
	 */
	function processFiles(event) {

		event.preventDefault();
		removeHighlight();

		if(event.type == 'change') {

			var files = event.target.files;
		}
		else if(event.type == 'drop') {

			var files = event.dataTransfer.files;
		}

		var progressBar = createProgressBar(settings.animateProgressBar);
		var ajax = getXMLHttpRequestObject();
		var fd = new FormData();
		var cache = false;
		var uploadListItem = createListElement();

		if(!cache)
		{
			fd.append('_', new Date().getTime());
		}

		for(var i = 0 ; i < files.length ; i++) {

			fd.append('file[]', files[i]);
		}
		

		uploadListItem.appendChild(progressBar);
		container.append(uploadListItem);

		ajax.upload.onprogress = updateProgressBar;
		ajax.upload.progressBar = progressBar;

		ajax.open('post', settings.URL);
		
		ajax.onreadystatechange = getAjaxResponse;
		ajax.progressBar = progressBar;
		ajax.uploadListItem = uploadListItem;

		ajax.send(fd);
	}

	/**
	 * This function processes the files.
	 */
	function processFile(event, node) {

		if(event.type == 'click') {

			var uploadListItem = this.parentNode;
			var file = event.target.file;
		
		} else {

			var uploadListItem = node;
			var file = event;
		} 
		
		var progressBar = createProgressBar(settings.animateProgressBar);
		var ajax = getXMLHttpRequestObject();
		var fd = new FormData();
		var cache = false;

		if(!cache)
		{
			fd.append('_', new Date().getTime());
		}

		fd.append('file', file);

		empty(uploadListItem);

		uploadListItem.append(progressBar);

		ajax.upload.onprogress = updateProgressBar;
		ajax.upload.progressBar = progressBar;

		ajax.open('post', settings.URL);
		ajax.setRequestHeader("Content-Type", "multipart/form-data");
		
		ajax.onreadystatechange = getAjaxResponse;
		
		ajax.progressBar = progressBar;
		ajax.uploadListItem = uploadListItem;

		ajax.send(fd);
	}

	/**
	 * This function update the file upload progressbar.
	 */
	function updateProgressBar(event) {
		
		if(event.lengthComputable) {
		 	
			var percentComplete = Math.ceil((event.loaded / event.total) * 100);

			if(percentComplete < 98) {
			
				this.progressBar.childNodes[0].style.width = percentComplete + '%';
				
				if(settings.showPrecentage)
					this.progressBar.childNodes[0].innerHTML = percentComplete + '%';
			}
		   
		  } else {
		  	throw new Error('Unable to get the progress of the file. Filesize is unknown.');
		  }

	}

	/**
	 * This function handles the response from the server side script.
	 */
	function getAjaxResponse() {

		var ajax = this;
		var status = ajax.status;
		
		if(ajax.readyState === 4) {
			
			if((status >= 200 && status < 300) || status === 304)
			{
					for(var i = 95; i <= 100 ; i++) {
						
						ajax.progressBar.childNodes[0].style.width = i + '%';
						
						if(settings.showPrecentage)
							ajax.progressBar.childNodes[0].innerHTML = i + '%';
					}
					
					setTimeout(function() {
						ajax.uploadListItem.remove();
						uploadListItems.pop(ajax.uploadListItem);
					}, 1000);

					return settings.success.call(this, this.response);

			} else { 
				console.log(1);
				throw new Error('error occured: ' + status);
				return settings.error.call(this, this.response);
			}
		}
	}

	/**
	 * This function opens the files dialog box.
	 */
	function openFilesDialogBox() {

		document.getElementById('fileInput').click();
	}

	/**
	 * Depends on the browser an XHR object will be returned.
	 */
	function getXMLHttpRequestObject() {

	    if (window.XMLHttpRequest) {

	        return new window.XMLHttpRequest;

	    }
	    else if (window.ActiveXObject) {
	        
	        return new ActiveXObject("MSXML2.XMLHTTP.3.0");

	    } else {

	    	throw new Error('This browser does not support ajax');

	    }
	}


	// Helper functions

	/**
	 * remove an item from the upload items.
	 */
	function removeItem() {

		this.parentNode.remove();
		uploadListItems.pop(this);
	}

	/**
	 * This function is just for removing all child nodes.
	 */
	function empty(node) {
		
		while(node.hasChildNodes()) {

		    node.removeChild(node.lastChild);
		}
	}

	/**
	 * Overrides the properties of the origin object.
	 */
	function extendDefaults(source, properties) {

		var property;
		
		for(property in properties) {

			if(properties.hasOwnProperty(property)) {
				source[property] = properties[property];
			}
		}

		return source;
	}

	/**
	 * Checks if the progressbar style tag has already been imported.
	 */
	function progressBarStyleTagAlreadyImported() {

		var stylesheets = document.styleSheets;

		for(var i = 0; i < stylesheets.length ; i++) {
			var rules = stylesheets[i].rules || stylesheets[i].cssRules;
			for(var rule in rules) {
				if(rules[rule].selectorText == '.progress')
					return true;
			}
		}
	}

	/**
	 * This function imports only what we need for this pretty progressbar.
	 */
	function importBootstrapProgressBarStyleTags() {

		if(progressBarStyleTagAlreadyImported())
			return;

		styleTags = document.createElement('style');

		var style = '';

		style += '.progress {';
		style += 'height: 40px;';
		style += 'line-height: 35px;';
		style += 'margin-bottom: 20px;';
		style += 'overflow: hidden;';
		style += 'background-color: #f5f5f5;';
		style += 'border-radius: 4px;';
		style += '-webkit-box-shadow: inset 0 1px 2px rgba(0,0,0,.1);';
		style += 'box-shadow: inset 0 1px 2px rgba(0,0,0,.1);';		
		style += '}';

		style += '.progress-bar {';
		style += 'float: left;';
		style += 'height: 100%;';
		style += 'font-size: 1.2em;';
		style += 'color: #fff;';
		style += 'text-align: center;';
		style += 'background-color:' + settings.progressBarColor +';';
		style += '-webkit-box-shadow: inset 0 -1px 0 rgba(0,0,0,.15);';
		style += 'box-shadow: inset 0 -1px 0 rgba(0,0,0,.15);';
		style += 'transition: width .4s ease;';
		style += '}';

		style += '.progress-bar-striped, .progress-striped .progress-bar {';
		style += 'background-image: -webkit-linear-gradient(45deg,rgba(255,255,255,.15) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.15) 50%,rgba(255,255,255,.15) 75%,transparent 75%,transparent);';
		style += 'background-image: -o-linear-gradient(45deg,rgba(255,255,255,.15) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.15) 50%,rgba(255,255,255,.15) 75%,transparent 75%,transparent);';
		style += 'background-image: linear-gradient(45deg,rgba(255,255,255,.15) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.15) 50%,rgba(255,255,255,.15) 75%,transparent 75%,transparent);';
		style += '-webkit-background-size: 40px 40px;';
		style += 'background-size: 40px 40px;';
		style += '}';

		style += '.progress-bar.active, .progress.active .progress-bar {';
		style += '-webkit-animation: progress-bar-stripes 2s linear infinite;';
		style += '-o-animation: progress-bar-stripes 2s linear infinite;';
		style += 'animation: progress-bar-stripes 2s linear infinite;';
		style += '}'

		style += '@keyframes progress-bar-stripes {';
		style += '0% {';
		style += 'background-position: 40px 0;';
		style += '}';
		style += '100% {';
		style += 'background-position: 0 0;';
		style += '}';
		style += '}';

		styleTags.innerHTML = style;

		addProgressBarStyleTags(styleTags);
	}

	/**
	 * This function adds a style tags to the head tags.
	 */
	function addProgressBarStyleTags(styleTags) {
		
		document.head.appendChild(styleTags);
	}

}());