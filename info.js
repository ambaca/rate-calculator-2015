



var units = ["Mbps", "MB/s", "Kbps", "KB/s"];
var units_definitions = ["Mega bits per second", "Mega Bytes per second", "Kilo bits per second", "Kilo Bytes per second"];


var server_settings = {
	sv_maxrate: 0,
	sv_maxupdaterate: 66,
	sv_maxcmdrate: 66,
	sv_minrate: 3500,
	sv_minupdaterate: 10,
	sv_mincmdrate: 10,
	sv_client_cmdrate_difference: 20
}

var client_settings = {
	player_fps: 60,
	rate: 30000,
	cl_updaterate: 20,
	cl_cmdrate: 30,
	cl_interp: 0.1,
	cl_interp_ratio: 2.0
}

var client_real_settings = {
	rate: 30000,
	updaterate: 20,
	cmdrate: 30,
	interp: 0.1,
	cl_interp_ratio: 2.0
}

function PageOnLoad()
{
	UpdateUpload();

	document.getElementById("player_fps").value = client_settings.player_fps;
	SetDefaultServerSettings();
	SetDefaultClientSettings();
	CheckServerTickrate();
	UpdateResults();
	document.getElementById("loading_text").style.display="none";
}

function SetDefaultClientSettingsButton()
{

	SetDefaultClientSettings();
	ClientSettingsChange();
}

function CheckServerTickrate()
{
	var tickrate = parseInt(document.getElementById("tickrate").value);

	if(tickrate <= 10.0)
	{
		tickrate = 11;
	}
	else if(tickrate > 128)
	{
		tickrate = 128;
	}
	document.getElementById("tickrate").value = tickrate;
	document.getElementById("server_fps").value = tickrate;
	ClientSettingsChange();
}

function SetDefaultServerSettings()
{
	document.getElementById("sv_maxrate").value = server_settings.sv_maxrate;
	document.getElementById("sv_maxupdaterate").value = server_settings.sv_maxupdaterate;
	document.getElementById("sv_maxcmdrate").value = server_settings.sv_maxcmdrate;
	document.getElementById("sv_minrate").value = server_settings.sv_minrate;
	document.getElementById("sv_minupdaterate").value = server_settings.sv_minupdaterate;
	document.getElementById("sv_mincmdrate").value = server_settings.sv_mincmdrate;
	document.getElementById("sv_client_cmdrate_difference").value = server_settings.sv_client_cmdrate_difference;
}

function SetDefaultClientSettings()
{
	document.getElementById("rate").value = client_settings.rate;
	document.getElementById("cl_updaterate").value = client_settings.cl_updaterate;
	document.getElementById("cl_cmdrate").value = client_settings.cl_cmdrate;
	document.getElementById("cl_interp").value = parseFloat(client_settings.cl_interp).toFixed(1);
	document.getElementById("cl_interp_ratio").value = parseFloat(client_settings.cl_interp_ratio).toFixed(1);
}

function ClientSettingsChange()
{
	// pick client settings
	var rate = parseInt(document.getElementById("rate").value) || 0;
	var cl_updaterate = parseInt(document.getElementById("cl_updaterate").value) || 0;
	var cl_cmdrate = parseInt(document.getElementById("cl_cmdrate").value) || 0;
	var cl_interp = parseFloat(document.getElementById("cl_interp").value) || 0.0;
	var cl_interp_ratio = parseFloat(document.getElementById("cl_interp_ratio").value) || 0.0;

	if(cl_interp < 0.0 || cl_interp > 0.5)
	{
		cl_interp = cl_interp < 0.0 ? 0.0 : 0.5;
		document.getElementById("cl_interp").value = cl_interp.toFixed(2);
	}
	//sv_client_min_interp_ratio 1;sv_client_max_interp_ratio 5
	if(cl_interp_ratio < 1.0 || cl_interp_ratio > 5.0)
	{
		cl_interp_ratio = cl_interp_ratio < 1.0 ? 1.0 : 5.0;
		document.getElementById("cl_interp_ratio").value = cl_interp_ratio.toFixed(2);
	}
	client_real_settings.cl_interp_ratio = cl_interp_ratio;

	// pick server settings
	var sv_maxrate = parseInt(document.getElementById("sv_maxrate").value) || 0;
	var sv_maxupdaterate = parseInt(document.getElementById("sv_maxupdaterate").value) || 0;
	var sv_maxcmdrate = parseInt(document.getElementById("sv_maxcmdrate").value) || 0;
	var sv_minrate = parseInt(document.getElementById("sv_minrate").value) || 0;
	var sv_minupdaterate = parseInt(document.getElementById("sv_minupdaterate").value) || 0;
	var sv_mincmdrate = parseInt(document.getElementById("sv_mincmdrate").value) || 0;
	var sv_client_cmdrate_difference = parseInt(document.getElementById("sv_client_cmdrate_difference").value) || 0;


	var updaterate = cl_updaterate;
	var cmdrate = cl_cmdrate;

	// restrictions
	// wierd magic trick under rate 1000
	if(sv_maxrate > 0 && rate < 1000)
	{
		rate = Math.min(Math.max(sv_maxrate, sv_minrate), 1000);
	}
	else if(sv_maxrate > 0 && rate > sv_maxrate)
	{
		rate = sv_maxrate;
	}
	// min. rate make last rectriction
	if(rate < sv_minrate)
	{
		rate = sv_minrate;
	}

	// max. updaterate make last restriction
	if(updaterate < sv_minupdaterate)
	{
		updaterate = sv_minupdaterate;
	}

	if(updaterate > sv_maxupdaterate)
	{
		updaterate = sv_maxupdaterate;
	}

	// server low FPS restrict updaterate
	var server_fps = parseInt(document.getElementById("server_fps").value) || 0;
	if(updaterate > server_fps)
	{
		updaterate = server_fps;
	}

	var fps_min = parseInt(document.getElementById("server_fps").min) || 0;
	if(updaterate < fps_min) // ...pls!
	{
		updaterate = fps_min;
		document.getElementById("server_fps").value = fps_min;
	}


	// max. cmrate make last restriction
	if(sv_mincmdrate > 0)
	{
		if(cmdrate > updaterate + sv_client_cmdrate_difference)
		{
			cmdrate = updaterate + sv_client_cmdrate_difference;
		}
		else if(cmdrate < updaterate - sv_client_cmdrate_difference)
		{
			cmdrate = updaterate - sv_client_cmdrate_difference;
		}

		if(cmdrate < sv_mincmdrate)
		{
			cmdrate = sv_mincmdrate;
		}

		if(cmdrate > sv_maxcmdrate)
		{
			cmdrate = sv_maxcmdrate;
		}
	}

	// client low FPS restrict cmdrate
	var player_fps = parseInt(document.getElementById("player_fps").value) || 0;
	if(cmdrate > player_fps)
	{
		cmdrate = player_fps;
	}

	fps_min = parseInt(document.getElementById("player_fps").min) || 0;
	if(cmdrate < fps_min) // ...pls!
	{
		cmdrate = fps_min;
		document.getElementById("player_fps").value = fps_min;
	}

	// low tickrate
	var tickrate = parseInt(document.getElementById("tickrate").value) || 0;
	if(cmdrate > tickrate)
	{
		cmdrate = tickrate;
	}

	if(updaterate > tickrate)
	{
		updaterate = tickrate;
	}

	client_real_settings.rate = rate;
	client_real_settings.updaterate = updaterate;
	client_real_settings.cmdrate = cmdrate;

	// interpolation
	// 0.1 s = 2 x ( 1.0f / cl_updaterate default of 20 ) )
	client_real_settings.interp = Math.max( cl_interp, cl_interp_ratio / parseFloat(cl_updaterate) );
	client_real_settings.interp = Math.max( client_real_settings.interp, 1.0 / parseFloat(cl_updaterate) );

	UpdateNetGraph();

}

function UpdateNetGraph()
{
	//document.getElementById("server_fps").value = document.getElementById("tickrate").value;
	document.getElementById("cl_updaterate_show").value = document.getElementById("cl_updaterate").value;
	document.getElementById("cl_cmdrate_show").value = document.getElementById("cl_cmdrate").value;
	document.getElementById("updaterate").value = client_real_settings.updaterate;
	document.getElementById("cmdrate").value = client_real_settings.cmdrate;
	document.getElementById("lerp").innerHTML = (client_real_settings.interp*1000.0).toFixed(1);
	document.getElementById("kilobytes").value = (client_real_settings.rate/1000).toFixed(2);
	document.getElementById("packetsize").value = parseInt(client_real_settings.rate/client_real_settings.updaterate);

	document.getElementById("lerp_screen").style.color = "white";

	// lerp colors
	if(client_real_settings.cl_interp_ratio / parseFloat(document.getElementById("cl_updaterate").value) < 2.0 / parseFloat(document.getElementById("cl_updaterate").value))
	{
		document.getElementById("lerp_screen").style.color = "orange";
	}

	if(1.0 / parseFloat(document.getElementById("server_fps").value) > client_real_settings.interp )
	{
		document.getElementById("lerp_screen").style.color = "yellow";
	}

	document.getElementById("lerp_screen").title = "Ideal\ncl_interp_ratio 2.0; cl_interp "+ (2.0 / parseFloat(client_real_settings.updaterate)).toFixed(4);
	RecommendedSettings();
}

function PacketSizeChange()
{
	var packetsize = parseInt(document.getElementById("packetsize").value);
	if(packetsize < 1)
	{
		document.getElementById("packetsize").value = 1;
		packetsize = 1;
	}
	else if(packetsize > 9999)
	{
		document.getElementById("packetsize").value = 9999;
		packetsize = 9999;
	}

	//document.getElementById("rate").value = packetsize * document.getElementById("cl_updaterate").value;
	document.getElementById("rate").value = packetsize * client_real_settings.updaterate;

	ClientSettingsChange();
}

function RecommendedSettings()
{
	document.getElementById("output_sv_maxrate").innerHTML = '\"'+0+'\"';
	document.getElementById("output_sv_maxupdaterate").innerHTML = '\"'+client_real_settings.updaterate +'\"';
	document.getElementById("output_sv_maxcmdrate").innerHTML = '\"'+client_real_settings.cmdrate+'\"';
	document.getElementById("output_sv_minrate").innerHTML = '\"'+client_real_settings.rate+'\"';
	document.getElementById("output_sv_minupdaterate").innerHTML = '\"'+20+'\"';
	document.getElementById("output_sv_mincmdrate").innerHTML = '\"'+30+'\"';
	document.getElementById("output_sv_client_cmdrate_difference").innerHTML = '\"'+20+'\"';

	UpdateResults();
}

function ImgOn() {
    document.getElementById("popup").style.display = "block";
	
}

function ImgOff() {
    document.getElementById("popup").style.display = "none";
	
}

function UpdateUpload()
{
	var index;
	var text;

	for (index = 0; index < units.length; index++) {
		text += "<option>" + units[index] + "</option>";
	}
	document.getElementById("input_unit").innerHTML = text;
	document.getElementById("output_unit_definition").innerHTML = units_definitions[0];
}
function UpdateUnitDefinition(element)
{
	document.getElementById("output_unit_definition").innerHTML = units_definitions[element.selectedIndex];
	UpdateResults();
}

function UpdateResults()
{

	var unit_index = document.getElementById("input_unit").selectedIndex;
	var elemt_upload = document.getElementById("upload");
	var maxplayers = parseInt(document.getElementById("maxplayers").value) || 0;
	var upload_recommended = client_real_settings.rate * maxplayers;

	var upload_recommended_title;
	var maxplayers_recommended = parseFloat(elemt_upload.value) || 0.0;
	var upload_title = maxplayers_recommended;

	switch (unit_index) {
		case 0: // Mega bits per second
			upload_recommended /= 1000000.0;

			upload_recommended_title = "equally\n"+(upload_recommended).toFixed(2)+" MB/s\n"+(upload_recommended*1000).toFixed(0)+" KB/s";

			upload_recommended *= 8.0;

			maxplayers_recommended *= 1000000.0 / 8.0; // Upload Mbps to B/s
			upload_title = "equally\n"+(upload_title / 8.0).toFixed(2)+" MB/s\n"+((upload_title / 8.0)*1000.0).toFixed(0)+" KB/s";
			break;

		case 1: // Mega Bytes per second
			upload_recommended /= 1000000.0;

			upload_recommended_title = "equally\n"+(upload_recommended*8.0).toFixed(2)+" Mbps\n"+(upload_recommended*8.0*1000.0).toFixed(0)+" Kbps";

			maxplayers_recommended *= 1000000.0; // Upload MB/s to B/s
			upload_title = "equally\n"+(upload_title * 8.0).toFixed(2)+" Mbps\n"+((upload_title * 8.0)*1000).toFixed(0)+" Kbps";
			break;

		case 2: // Kilo bits per second
			upload_recommended /= 1000.0;

			upload_recommended_title = "equally\n"+(upload_recommended).toFixed(0)+" KB/s\n"+(upload_recommended/1000.0).toFixed(2)+" MB/s";

			upload_recommended *= 8.0;

			maxplayers_recommended *= 1000.0 / 8.0; // Upload Kbps to B/s
			upload_title = "equally\n"+(upload_title / 8.0).toFixed(0)+" KB/s\n"+((upload_title / 8.0)/1000).toFixed(2)+" MB/s";
			break;

		case 3: // Kilo Bytes per second
			upload_recommended /= 1000.0;

			upload_recommended_title = "equally\n"+(upload_recommended*8.0).toFixed(0)+" Kbps\n"+(upload_recommended*8.0/1000.0).toFixed(2)+" Mbps";

			maxplayers_recommended *= 1000.0; // Upload KB/s to B/s
			upload_title = "equally\n"+(upload_title * 8.0).toFixed(0)+" Kbps\n"+((upload_title * 8.0)/1000).toFixed(2)+" Mbps";
			break;
	}

	elemt_upload.title = upload_title;
	upload_recommended = upload_recommended.toFixed(2)+" "+units[unit_index];
	maxplayers_recommended /= client_real_settings.rate; // Divide upload with rate
	document.getElementById("output_maxplayers").innerHTML = maxplayers;
	document.getElementById("output_upload_recommended").innerHTML = upload_recommended;
	document.getElementById("output_upload_recommended").title = upload_recommended_title;
	document.getElementById("output_maxplayers_recommended").innerHTML = parseFloat(maxplayers_recommended).toFixed(0);
}
function functiontest()
{
	ClientSettingsChange();
}