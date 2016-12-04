
/*
|--------------------------------------------------------------------------
| UploadManager Plugin JS
|--------------------------------------------------------------------------
| This plugin creates an Upload Manager
| 
|
*/

(function()
{

	var settings = {};
	
	var dropBox = {};	
	
	var dropBoxTitle = {};

	var uploadListItems = [];
	
	var fileInput = {};
	
	var chooseButton = {};
	
	var container = {};

	// The constructor
	this.UploadManager = function() {

		this.timeOut = null;

		var defaults = {
			dragAndDrop: false,
			dropBoxTitle: 'Drag Images Here..',
			containerWidth: 'auto',
			containerHeight: 200,
			attachTo: '.upload',
			timeOut: 3000,
			buttonOnThe: 'right',
			buttonInnerText: 'Choose',
		}

		settings = defaults;

		if(arguments[0] && typeof arguments[0] === "object") {

			settings = extendDefaults(defaults, arguments[0]);	
		}
	}

	

	// This method create the upload manager and attach it to the selected element
	UploadManager.prototype.attachTo = function(div) {

		container = document.querySelector(div);

		if(settings.dragAndDrop)
		{
			dropBox = createDropBox();

			container.appendChild(dropBox);
			dropBox.addEventListener('drop', listFiles);
		}

		fileInput = createFileInput();
		chooseButton = createButton(settings);
		
		chooseButton.addEventListener('click', openFilesDialogBox);
		fileInput.addEventListener('change', listFiles);

		container.appendChild(fileInput);
		container.appendChild(chooseButton);
	}


	// Extending the default object by letting the object to be overrided if the properties exists.
	function extendDefaults(source, properties) {

		var property;
		
		for(property in properties) {

			if(properties.hasOwnProperty(property)) {
				source[property] = properties[property];
			}
		}

		return source;
	}


	// This method creates the drag and drop box
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

	// This function creates the input invisible for the files
	function createFileInput() {

		var input = document.createElement('input');

		input.type = 'file';
		input.name = 'file[]';
		input.style.visibility = 'hidden';
		input.id = 'fileInput';
		input.multiple = true;

		return input;
	}

	// This function creates the upload button
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

	// List the files to be uploaded
	function listFiles(files) {

		event.preventDefault();

		if(event.type == 'change') {

			files = event.target.files;
		}
		else if(event.type == 'drop') {

			dropBox.style.border = '1px dotted #a6a6a6';
			dropBoxTitle.style.color = '#a6a6a6';
			files = event.dataTransfer.files;
		}

		for(var i = 0; i < files.length ; i++) {

			var uploadItem = listFile(files[i]);

			uploadListItems.push(uploadItem);
		}

		for(var i = 0; i < uploadListItems.length; i++)
		{
			container.appendChild(uploadListItems[i]);
		}
		
		return false;
	}

	// This function wrap the file inside a list item
	function listFile(file) {
		
		var list = document.createElement('li');

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

		list.style.width = '98%';
		list.style.height = '40px';
		list.style.lineHeight = '35px';
		list.style.padding = '6px 6px';
		list.style.border = '1px solid #000000';
		list.style.listStyleType = 'none';
		list.style.marginTop = '5px';
		list.style.display = 'inline-block';

		var reader = new FileReader();
		var preview = document.createElement('img');

		preview.style.height = '40px';
		preview.style.width = '40px';
		preview.style.verticalAlign = 'middle';
		preview.style.marginRight = '10px';

		reader.addEventListener('load', function () {
				
			preview.src = this.result;

		}, false);

		if(file)
		    reader.readAsDataURL(file);		
		else
			preview.src = "";
	
		console.log(preview);

		var fileName = document.createElement('span');
		fileName.innerHTML = file.name;

		list.appendChild(preview);		
		list.appendChild(fileName);
		list.appendChild(uploadButton);
		list.appendChild(removeButton);

		removeButton.addEventListener('click', removeItem);

		return list;
	}


	// Event Listeners

	// This function changes the color of the drop box
	function changeDropBoxStyle(event) {
		
		event.preventDefault();

		if(event.type == "dragover") {

			dropBox.style.border = '2px dotted #000000'
			dropBoxTitle.style.color = '#000000';
		
		} else if(event.type == "dragleave") {

			dropBox.style.border = '1px dotted #a6a6a6';
			dropBoxTitle.style.color = '#a6a6a6';
		}
	}

	// This function processes the files
	function processFiles(event) {

		
		
	
	
	}

	// This function opens the files dialog box
	function openFilesDialogBox() {

		document.getElementById('fileInput').click();
	}

	function removeItem() {

		this.parentNode.remove();
		uploadListItems.pop(this);
	}


}());