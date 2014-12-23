



var units = ["Mbps", "MB/s", "Kbps", "KB/s"];
var units_definitions = ["Mega bits per second", "Mega Bytes per second", "Kilo bits per second", "Kilo Bytes per second"];


function PageOnLoad()
{
	var index;
	var text = "";

	for (index = 0; index < units.length; index++) {
		text += units_definitions[index]+"<br>";
	}
	document.getElementById("units").innerHTML = text;
}