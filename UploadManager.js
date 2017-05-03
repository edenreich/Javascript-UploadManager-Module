
/*
|--------------------------------------------------------------------------
| UploadManager Module JS
|--------------------------------------------------------------------------
| This Javascript Module creates an Upload Manager
| 
| 
*/

var UploadManager = function()
{

	'use strict';

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
	 * stores the settings of the upload manager.
	 */
	var settings = {};

	/**
	 * determine wether the mouse dragged something over the box.
	 */
	var isDraggedOver = false;

	/**
	 * cloud icon to appear as the user drag something over the box.
	 */
	var svgUploadCloud = {};

	/**
	 * store the default settings.
	 */
	var defaults = {
			bindTo: '.upload',
			dragAndDrop: false,
			dropBoxTitle: 'Drag Images Here..',
			containerWidth: 'auto',
			containerHeight: 200,
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
			cloudColor: '#006DF0',
			titleFontFamily: 'arial',
			dropBoxOnOverTitle: 'Drop it..'
		};
	
	/**
	 * The constructor:
	 * - checks if the developer passed an object as the settings.
	 * - extending the default settings and override them.
	 */
	function init(devSettings) {
		if(devSettings && typeof devSettings === "object") {
			settings = extendDefaults(defaults, devSettings);	
		}

		bindTo(settings.bindTo);
		styleElements();
	}

	/**
	 * This method create the upload manager and attach it to the selected element.
	 */
	function bindTo(className) {
		// store the attached element
		container = document.querySelector(className);
		// add the dropbox if it was requested
		if(settings.dragAndDrop) {
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

		var svgDropBoxFrame = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

		svgDropBoxFrame.setAttributeNS(null, 'width', '100%');
		svgDropBoxFrame.setAttributeNS(null, 'height', '100%');
		svgDropBoxFrame.setAttributeNS(null, 'preserveAspectRatio', 'none');

		var svgGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
		var svgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
		dropBoxTitle = document.createElementNS('http://www.w3.org/2000/svg', 'text');

		svgRect.setAttributeNS(null, 'x', '0');
		svgRect.setAttributeNS(null, 'y', '0');
		svgRect.setAttributeNS(null, 'width', '100%');
		svgRect.setAttributeNS(null, 'height', '100%');
		svgRect.setAttributeNS(null, 'fill', 'none');
		svgRect.setAttributeNS(null, 'stroke', '#000000');
		svgRect.setAttributeNS(null, 'stroke-width', '5');
		svgRect.setAttributeNS(null, 'stroke-dasharray', '50 50');

		dropBoxTitle.setAttributeNS(null, 'x', '50%');
		dropBoxTitle.setAttributeNS(null, 'y', '50%');
		dropBoxTitle.setAttributeNS(null, 'text-anchor', 'middle');
		dropBoxTitle.setAttributeNS(null, 'font-size', '35');

		svgGroup.appendChild(svgRect);
		svgGroup.appendChild(dropBoxTitle);
		svgDropBoxFrame.appendChild(svgGroup);

		dropBox.appendChild(svgDropBoxFrame);

		dropBoxTitle.innerHTML = settings.dropBoxTitle;
		
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
		input.className = 'upload-input';
		input.id = 'fileInput';
		input.multiple = true;

		return input;
	}

	/**
	 * This function creates the upload button.
	 */
	function createButton(options) {
		var button = document.createElement('button');
			
		button.className = 'choose-button';
		
		if(options.hasOwnProperty('name')) {
			button.name = options.name;
		}

		if(options.hasOwnProperty('class')) {
			button.className = options.class;
		}

		if(options.hasOwnProperty('buttonInnerText')) {
			button.innerHTML = options.buttonInnerText;
		}

		if(options.hasOwnProperty('buttonOnThe')) {
			button.style.float = options.buttonOnThe;
		}

		return button;
	}

	/**
	 * creates the progress bar element, pass animate as true if animate has been set.
	 */
	function createProgressBar(animate) {
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
		list.className = 'upload-list-item';
		
		return list;
	}

	/**
	 * Changes the look of the frame, normally as the user drag something over.
	 */
	function addHighlight() {
		if(isDraggedOver) {
			return;
		}

		isDraggedOver = true;
		dropBoxTitle.innerHTML = settings.dropBoxOnOverTitle;
		appendSVGUploadCloudIcon();
		addClass(dropBox, 'item-is-dragged-over');
	}

	/**
	 * simply removes the highlist of the dropbox as the files is being dropped.
	 */
	function removeHighlight() {
		if(! isDraggedOver) {
			return;
		}

		isDraggedOver = false;
		dropBoxTitle.innerHTML = settings.dropBoxTitle;
		removeSVGUploadCloudIcon();
		removeClass(dropBox, 'item-is-dragged-over');
	}

	/**
	 * List the files to be uploaded.
	 */
	function listFiles(files) {
		event.preventDefault();
		removeHighlight();

		if(event.type == 'change') {
			var files = event.target.files;
		} else if(event.type == 'drop') {
			var files = event.dataTransfer.files;
		}

		for(var i = 0; i < files.length ; i++) {
			var uploadItem = listFile(files[i]);

			uploadListItems.push(uploadItem);
		}

		for(var i = 0; i < uploadListItems.length; i++) {
			container.appendChild(uploadListItems[i]);

			if(settings.autoStart) {
				processFile(files[i], uploadListItems[i]);
			}
		}

		return false;
	}

	/**
	 * This function wrap the file inside a list item.
	 */
	function listFile(file) {
		var list = createListElement();

		var removeButton = createButton({
								class: 'remove-button', 
								buttonInnerText: 'Remove',
								buttonOnThe: 'right',
								name: 'removeButton',
							});

		var uploadButton = createButton({
								class: 'upload-button',
								buttonInnerText: 'Upload',
								buttonOnThe: 'right',
							});

		var reader = new FileReader();
		var preview = document.createElement('img');
		preview.className = 'upload-preview';

		reader.onload = function() {	
			preview.src = this.result;
		};

		if(file) {
		    reader.readAsDataURL(file);		
		}
		else {
			preview.src = "";
		}

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
		} else if(event.type == 'drop') {
			var files = event.dataTransfer.files;
		}

		var progressBar = createProgressBar(settings.animateProgressBar);
		var ajax = getXMLHttpRequestObject();
		var fd = new FormData();
		var cache = false;
		var uploadListItem = createListElement();

		if(!cache) {
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
				
				if(settings.showPrecentage) {
					this.progressBar.childNodes[0].innerHTML = percentComplete + '%';
				}
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
	 * Checks if the progressbar style tag has already been exist.
	 */
	function progressBarStyleTagExist() {
		return document.getElementById('bootstrapProgressbar');
	}

	/**
	 * Checks if the UploadManager style tag has already been exist.
	 */
	function uploadManagerStyleTagExist() {
		return document.getElementById('uploadManager');
	}

	/**
	 * Add some styles and append them to the Head-Tag.
	 */
	function styleElements() {
		addBootstrapProgressBarStyleTag();
		addUploadManagerStyleTag();
	}

	function addUploadManagerStyleTag() {
		if(uploadManagerStyleTagExist()) {
			return;
		}

		var styleTag = document.createElement('style');
		styleTag.setAttribute('id', 'uploadManager');
		var CSS = `

			.drop-box {
				position: relative;
				font-family: ${settings.titleFontFamily};
				width: ${settings.containerWidth}px;
				height: ${settings.containerHeight}px;
				border: 0;
				text-align: center;
				margin: 0 auto;
			}

			.drop-box.item-is-dragged-over > .drop-box-title {
				color: #000000;
			}

			.drop-box.item-is-dragged-over > svg {
				z-index: 3;
			}

			.drop-box.item-is-dragged-over > svg > g > rect {
				
  				animation: dash 5s linear;
  				animation-iteration-count: infinite;
			}

			.drop-box > svg > g > text {
				font-size: 1.6em;
				fill: #a6a6a6;
			}

			.drop-box > .upload-cloud {
				z-index: 0;
				opacity: 0.7;
				position: relative;
				display: block;
				margin: -60px auto;
				width: 20%;
				height 20%;
			}

			.drop-box > .upload-cloud.bump-up {
				animation-name: bump;
    			animation-duration: 1s;
    			animation-timing-function: linear;
    			animation-iteration-count: infinite;
    			animation-direction: alternate;
			}

			.drop-box > .upload-cloud > svg {
				width: 100%;
				height: 100%;
			}

			.upload-input {
				visibility: hidden;
			}

			.upload-list-item {
				width: 98%;
				height: 40px;
				line-height: 35px;
				padding: 6px 6px;
				border: 1px solid #a6a6a6;
				list-style-type: none;
				margin-top: 5px;
				display: inline-block;
			}

			.choose-button,
			.upload-list-item > .remove-button,
			.upload-list-item > .upload-button {
				font-size: 14px;
				font-weight: 400;
				text-align: center;
				white-space: nowrap;
				vertical-align: middle;
				user-select: none;
				background-image: none;
				background: transparent;
				border: 1px solid transparent;
				cursor: pointer;
				display: inline-block;
			}

			.choose-button {
				border: 2px solid #257C8A;
				padding: 16px 20px;
				color: #257C8A;
			}

			.choose-button:hover {
				background-color: #257C8A;
				color: #ffffff;
			}

			.upload-list-item > .remove-button,
			.upload-list-item > .upload-button {
				padding: 12px 14px;
				margin: 0 3px;
			}

			.upload-list-item > .remove-button {
				background: #f45a5a;
			}

			.upload-list-item > .upload-button {
				background: #42f4df;
			}

			.upload-list-item > .upload-preview {
				height: 40px;
				width: 40px;
				vertical-align: middle;
				margin-right: 10px;
			}

			@-webkit-keyframes bump {
				0% {
					transform: translateY(0px);
				} 100% {
					transform: translateY(10px);
				}
			}

			@keyframes bump {
				0% {
					transform: translateY(0px);
				} 100% {
					transform: translateY(10px);
				}
			}

			@keyframes dash {
			  to {
			    stroke-dashoffset: 500;
			  }
			}
		`;

		CSS = minify_css(CSS);
		styleTag.innerHTML = CSS;

		document.head.appendChild(styleTag);
	}

	/**
	 * This function imports only what we need for this pretty progressbar.
	 */
	function addBootstrapProgressBarStyleTag() {
		if(progressBarStyleTagExist()) {
			return;
		}

		var styleTag = document.createElement('style');
		styleTag.setAttribute('id', 'bootstrapProgressbar');
		var CSS = `

			.progress {
				height: 40px;
				line-height: 35px;
				margin-bottom: 20px;
				overflow: hidden;
				background-color: #f5f5f5;
				border-radius: 4px;
				-webkit-box-shadow: inset 0 1px 2px rgba(0,0,0,.1);
				box-shadow: inset 0 1px 2px rgba(0,0,0,.1);
			}

			.progress-bar {
				float: left;
				height: 100%;
				font-size: 1.2em;
				color: #fff;
				text-align: center;
				background-color: ${settings.progressBarColor};
				-webkit-box-shadow: inset 0 -1px 0 rgba(0,0,0,.15);
				box-shadow: inset 0 -1px 0 rgba(0,0,0,.15);
				transition: width .4s ease;
			}

			.progress-bar-striped, 
			.progress-striped .progress-bar {
				background-image: -webkit-linear-gradient(45deg,rgba(255,255,255,.15) 25%,
								  transparent 25%,transparent 50%,rgba(255,255,255,.15) 50%,
								  rgba(255,255,255,.15) 75%,transparent 75%,transparent);
				background-image: -o-linear-gradient(45deg,rgba(255,255,255,.15) 25%,
								  transparent 25%,transparent 50%,rgba(255,255,255,.15) 50%,
								  rgba(255,255,255,.15) 75%,transparent 75%,transparent);
				background-image: linear-gradient(45deg,rgba(255,255,255,.15) 25%,
								  transparent 25%,
								  transparent 50%,
								  rgba(255,255,255,.15) 50%,
								  rgba(255,255,255,.15) 75%,
								  transparent 75%,transparent);
				-webkit-background-size: 40px 40px;
				background-size: 40px 40px;
			}

			.progress-bar.active, 
			.progress.active .progress-bar {
				-webkit-animation: progress-bar-stripes 2s linear infinite;
				-o-animation: progress-bar-stripes 2s linear infinite;
				animation: progress-bar-stripes 2s linear infinite;
			}

			@keyframes progress-bar-stripes {
				0% {
					background-position: 40px 0;
				}
				100% {
					background-position: 0 0;
				}
			}
		`;

		CSS = minify_css(CSS);
		styleTag.innerHTML = CSS;

		document.head.appendChild(styleTag);
	}

	/**
	 * appends a nice cloud svg icon to the drop box.
	 */
	function appendSVGUploadCloudIcon() {
		svgUploadCloud = document.createElement('div');

		svgUploadCloud.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Capa_1" x="0px" y="0px" viewBox="0 0 486.3 486.3" style="enable-background:new 0 0 486.3 486.3;" xml:space="preserve" width="512px" height="512px">
						<g>
							<g>
								<path d="M395.5,135.8c-5.2-30.9-20.5-59.1-43.9-80.5c-26-23.8-59.8-36.9-95-36.9c-27.2,0-53.7,7.8-76.4,22.5    c-18.9,12.2-34.6,28.7-45.7,48.1c-4.8-0.9-9.8-1.4-14.8-1.4c-42.5,0-77.1,34.6-77.1,77.1c0,5.5,0.6,10.8,1.6,16    C16.7,200.7,0,232.9,0,267.2c0,27.7,10.3,54.6,29.1,75.9c19.3,21.8,44.8,34.7,72,36.2c0.3,0,0.5,0,0.8,0h86    c7.5,0,13.5-6,13.5-13.5s-6-13.5-13.5-13.5h-85.6C61.4,349.8,27,310.9,27,267.1c0-28.3,15.2-54.7,39.7-69    c5.7-3.3,8.1-10.2,5.9-16.4c-2-5.4-3-11.1-3-17.2c0-27.6,22.5-50.1,50.1-50.1c5.9,0,11.7,1,17.1,3c6.6,2.4,13.9-0.6,16.9-6.9    c18.7-39.7,59.1-65.3,103-65.3c59,0,107.7,44.2,113.3,102.8c0.6,6.1,5.2,11,11.2,12c44.5,7.6,78.1,48.7,78.1,95.6    c0,49.7-39.1,92.9-87.3,96.6h-73.7c-7.5,0-13.5,6-13.5,13.5s6,13.5,13.5,13.5h74.2c0.3,0,0.6,0,1,0c30.5-2.2,59-16.2,80.2-39.6    c21.1-23.2,32.6-53,32.6-84C486.2,199.5,447.9,149.6,395.5,135.8z" fill="${settings.cloudColor}"/>
								<path d="M324.2,280c5.3-5.3,5.3-13.8,0-19.1l-71.5-71.5c-2.5-2.5-6-4-9.5-4s-7,1.4-9.5,4l-71.5,71.5c-5.3,5.3-5.3,13.8,0,19.1    c2.6,2.6,6.1,4,9.5,4s6.9-1.3,9.5-4l48.5-48.5v222.9c0,7.5,6,13.5,13.5,13.5s13.5-6,13.5-13.5V231.5l48.5,48.5    C310.4,285.3,318.9,285.3,324.2,280z" fill="${settings.cloudColor}"/>
							</g>
						</g>
						</svg>`;
		svgUploadCloud.className = 'upload-cloud bump-up';
		svgUploadCloud.setAttribute('id', 'uploadCloud');

		dropBox.appendChild(svgUploadCloud);
	}

	/**
	 * removes the cloud svg icon from the drop box.
	 */
	function removeSVGUploadCloudIcon() {
		var svgUploadCloud = svgUploadCloud || document.getElementById('uploadCloud');

		if(svgUploadCloud) {
			svgUploadCloud.parentNode.removeChild(svgUploadCloud);
		}
	}

	/**
	 * minifies the css text.
	 */
	function minify_css(string) {
	    string = string.replace(/\/\*(?:(?!\*\/)[\s\S])*\*\/|[\r\n\t]+/g, '');
	    string = string.replace(/ {2,}/g, ' ');
	    string = string.replace(/([{:}])/g, '$1');
	    string = string.replace(/([;,]) /g, '$1');
	    string = string.replace(/ !/g, '!');
	    
	    return string;
	}

	function addClass(element, className) {
		if(hasClass(element, className)) return;

		element.className = element.className + ' ' + className;
	}

	function removeClass(element, className) {
		if(! hasClass(element, className)) return;
		console.log(className);
		element.className = element.className.replace(new RegExp('(?:^|\\s)'+ className + '(?:\\s|$)'), '');
	}

	function hasClass(element, className) {
		return (' ' + element.className + ' ').indexOf(' ' + className + ' ') > -1;
	}

	return {
		settings: function(settings) { 
			init(settings); 
		},
	};
};