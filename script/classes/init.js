function initClasses(useGame) {
	var boss = 0;
	var regionObjects = {};
	for(var gameName in regionNames) {
		if(gameName == useGame) {
			game = regionNames[gameName];
			var i = 1;
			for(var regionName in game) {
				region = game[regionName];
				for(var segment in region) {
					var segmentName = region[segment];
					var regionClassName = fix_region(regionName) + fix_region(segmentName);
					var regionObject = eval("new " + regionClassName + "()");

					if(useGame == "zelda3") {
						regionObject.initNoMajorGlitches();
					}
					if(useGame == "metroid3") {
						regionObject.initTournament();
					}

					regionObjects[regionClassName] = regionObject;

					var total = 0;

					for(var location in regionObject.locations) {
						location = regionObject.locations[location];

						var output = "";
						output += location.type + ": ";

						var d = document.createElement("div");
						d.innerHTML = location.name;
						var title = d.textContent.trim() || d.innerText.trim() || d.innerHTML.trim();
						var props = {
							name: location.name,
							x: location.x,
							y: location.y,
							titleEquipment: title,
							titleStripped: location.name,
							type: location.type,
							region: location.region,
						};
						if(useGame == "zelda3") {
							props.canAccess = {
								glitchless: location.glitchless,
								owglitches: location.owglitches,
								majorglitches: location.majorglitches
							};
						}
						if(useGame == "metroid3") {
							props.canAccess = {
								casualLogic: location.casualLogic,
								tourneyLogic: location.tourneyLogic
							};
						}
						if(location.equipment) {
							var regex = /%%([\w]+)%%/g;
							var equip = location.equipment;
							while(match = regex.exec(equip)) {
								location.equipment = location.equipment.replace(match[0],mini(match[1]));
							}
							props["titleEquipment"] += " " + location.equipment;
						}

						total++;

						if(total == 1) {
							regionObjects[regionClassName] = regionObject;
						}

						if(location.type == "Event") {
							var label = location.name.split(' ');
							label = label.map(x => {
								var ret = x;
								var smallWords = ["of"];
								if(smallWords.indexOf(ret) > -1) {
									ret = ret.toLowerCase();
								}
								ret = ret.substring(0,1);
								return ret;
							});
							var dungeon = {
								label: label.join(''),
								isBeatable: function() {
									const availability = new Availability();
									if(selectedGame == "zelda3") {
										if(regionObjects[this.region].canEnter.glitchless() && this.canAccess.glitchless()) {
											availability.glitchless = "available";
										}
									}
									if(selectedGame == "metroid3") {
										if(regionObjects[this.region].canEnter.casualLogic() && this.canAccess.casualLogic()) {
											availability.casualLogic = "available";
										}
										if(regionObjects[this.region].canEnter.tourneyLogic() && this.canAccess.tourneyLogic()) {
											availability.tourneyLogic = "available";
										}
									}
									return availability;
								},
								canGetChest: function() {
									return this.isBeatable();
								}
							};
							dungeon = Object.assign(props,dungeon);

							dungeons[gameName].push(dungeon);
							boss++;
						} else {
							var chest = {
								isImportant: false,
								isOpened: false
							};

							if(location.type == "Portal") {
								chest.isAvailable = function() {
									const availability = new Availability();
									if(selectedGame == "zelda3") {
										var tmp = "portal portal-metroid3";
										if(regionObjects[this.region].canEnter.glitchless() || this.canAccess.glitchless()) {
											availability.glitchless = tmp + " active";
											availability.owglitches = tmp + " active";
											availability.majorglitches = tmp + " active";
										} else {
											availability.glitchless = tmp + " inactive";
											availability.owglitches = tmp + " inactive";
											availability.majorglitches = tmp + " inactive";
										}
									}
									if(selectedGame == "metroid3") {
										var tmp = "portal portal-zelda3";
										if(regionObjects[this.region].canEnter.casualLogic() || this.canAccess.casualLogic()) {
											availability.casualLogic = tmp + " active";
											availability.tourneyLogic = tmp + " active";
										} else {
											availability.casualLogic = tmp + " inactive";
											availability.tourneyLogic = tmp + " inactive";
										}
									}
									return availability;
								};
							} else {
								chest.isSpicy = location.spicy;
								chest.isAvailable = function() {
									const availability = new Availability();
									if(selectedGame == "zelda3") {
										if(regionObjects[this.region].canEnter.glitchless() && this.canAccess.glitchless()) {
											availability.glitchless = "available";
										}
										if(regionObjects[this.region].canEnter.owglitches() && this.canAccess.owglitches()) {
											availability.owglitches = "available";
										}
										if(regionObjects[this.region].canEnter.majorglitches() && this.canAccess.majorglitches()) {
											availability.majorglitches = "available";
										}
									}
									if(selectedGame == "metroid3") {
										if(regionObjects[this.region].canEnter.casualLogic() && this.canAccess.casualLogic()) {
											availability.casualLogic = "available";
										}
										if(regionObjects[this.region].canEnter.tourneyLogic() && this.canAccess.tourneyLogic()) {
											availability.tourneyLogic = "available";
										}
									}
									return availability;
								}
							}

							chest = Object.assign(props,chest);
							chests[gameName].push(chest);
						}
					}
				}
			}
		}
	}
}