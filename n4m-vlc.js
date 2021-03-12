//https://github.com/alexandrucancescu/node-vlc-client

const max = require('max-api');
const VLC = require('vlc-client');

max.post("hello n4m-vlc");

let vlc = null;
let connected = false;

function isconnected() {
	if(!connected) {
		max.post("not connected to VLC");
	}
	return connected;
}

max.addHandlers({

connect: () => {
	vlc = new VLC.Client({
		ip: "localhost",	// for some reason passing localhost here stopped working on my machine
		//ip: "192.168.1.4",// and I was forced to use the actual IP to get it working again  ¯\_(ツ)_/¯
		port: 8080,
		password: "vlc"		// set your password here
	});
	if(vlc) {
		vlc.status().then((status) => {
			connected = true;
			max.post("connected to VLC");
			max.post(status);
		})
		.catch(err => {
			max.post('connection error');
			max.post(err);
		});

	}
	else {
		max.post("error connecting to VLC");
	}
},

get_status: (dname) => {
	if(isconnected()) {
		vlc.status().then((status) => {
			max.setDict(dname, status);
		})
	}
},

get_playlist: () => {
	if(isconnected()) {
		vlc.getPlaylist().then((plist) => {
			if(plist.length) {
				max.post(`got playlist with ${plist.length} items`)	
				max.outlet('playlist');
				plist.forEach(plitem => {
					max.outlet("item", plitem.name);
					max.outlet("id", plitem.id);
					//max.post(plitem);
				});
			}
			else {
				max.post(`got empty playlist`)
				max.outlet('playlist');
			}
		})
		.catch(err => {
			max.post('get_playlist error');
			max.post(err);
		});
		
	}
},

fullscreen: () => {
	if(isconnected()) {
		vlc.toggleFullscreen()
	}
},

clear: () => {
	if(isconnected()) {
		vlc.emptyPlaylist().then(() => {
			max.outlet('playlist');
		});
	}
},

vol : (val) => {
	if(isconnected()) {
		vlc.setVolume(val * 100.);
	}
},

loopall : (val) => {
	if(isconnected()) {
		vlc.setLooping(val > 0);
	}
},

loop : (val) => {
	if(isconnected()) {
		vlc.setRepeating(val > 0);
	}
},

add_file: (uri) => {
	if(isconnected()) {
		uri = "file://" + uri;
		vlc.addToPlaylist(uri).then(() => {
			max.outlet("playlistnotify")
		})
		.catch(err => {
			max.post('error loading File');
			max.post(err);
		})
	}
},

add_url: (url) => {
	if(isconnected()) {
		vlc.addToPlaylist(url).then(() => {
			max.outlet("playlistnotify")
		})
		.catch(err => {
			max.post('error loading URL');
			max.post(err);
		})
	}
},

play_item: (id) => {
	if(isconnected()) {
		vlc.playFromPlaylist(id);
	}
},

set_play: (state) => {
	if(isconnected()) {
		try {
			if(state === "start") {
				if(vlc.isStopped()) {
					vlc.next();
				}
				else {
					vlc.play()
				}
			}
			else if(state === "stop") {
				vlc.stop()
			}
			else if(state === "pause") {
				vlc.togglePlay()
			}
			else if(state === "next") {
				vlc.next()
			}
			else if(state === "previous") {
				vlc.previous()
			}
		}
		catch(err) {
			max.post('set_play error');
			max.post(err);
		}
	}
},

set_position: (pos) => {
	if(isconnected()) {
		vlc.setProgress(pos * 100);
	}
}

});
